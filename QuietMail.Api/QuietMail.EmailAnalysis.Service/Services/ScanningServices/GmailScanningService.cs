using System.Collections.Concurrent;
using System.Net;
using System.Text.RegularExpressions;
using Google;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Gmail.v1;
using Google.Apis.Requests;
using Google.Apis.Services;
using Microsoft.AspNetCore.SignalR;
using QuietMail.Api.Models;
using QuietMail.common.Hubs;
using QuietMail.EmailAnalysis.Service.Models;

public class GmailScanningService : IScanService
{
    public ProviderType providerType => ProviderType.Gmail;

    private readonly IHubContext<ProgressHub> _hubContext;

    public GmailScanningService(IHubContext<ProgressHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task StartScanAsync(string accessToken, string connectionId)
    {
        try
        {
            var credential = GoogleCredential.FromAccessToken(accessToken);
            var gmailService = new GmailService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "QuietMail"
            });

            // Use HashSet to protect against duplicate IDs from pagination shifts
            var allMessageIds = new HashSet<string>();
            string? nextPageToken = null;

            do
            {
                var listRequest = gmailService.Users.Messages.List("me");
                listRequest.Q = "label:INBOX";
                listRequest.PageToken = nextPageToken;
                listRequest.Fields = "messages(id),nextPageToken";
                listRequest.MaxResults = 500;

                var listResponse = await listRequest.ExecuteAsync();

                if (listResponse.Messages != null)
                {
                    foreach (var message in listResponse.Messages)
                    {
                        allMessageIds.Add(message.Id);
                    }
                }

                nextPageToken = listResponse.NextPageToken;
                await Task.Delay(25);
            }
            while (!string.IsNullOrEmpty(nextPageToken));

            long totalMessages = allMessageIds.Count;

            if (totalMessages == 0)
            {
                await _hubContext.Clients.Client(connectionId).SendAsync("ScanCompleted", new List<SenderAnalyticsDto>());
                return;
            }

            var senderAnalytics = new Dictionary<string, DomainAnalytics>();
            long processedMessages = 0;
            int batchSize = 20;
            int skippedCount = 0;

            var messageIdList = allMessageIds.ToList();

            for (int i = 0; i < messageIdList.Count; i += batchSize)
            {
                var chunk = messageIdList.Skip(i).Take(batchSize).ToList();
                var batchResults = new ConcurrentBag<(string Domain, string FullSenderAddress, bool IsOpened, bool IsMailList)>();
                var batch = new BatchRequest(gmailService);

                BatchRequest.OnResponse<Google.Apis.Gmail.v1.Data.Message> callback =
                    (msgResponse, error, index, message) =>
                    {
                        if (error != null || msgResponse?.Payload?.Headers == null)
                        {
                            Console.WriteLine($"[Batch Error] Message failed: {error.Message}");
                            Interlocked.Increment(ref skippedCount);
                            return;
                        }

                        var fromHeader = msgResponse.Payload.Headers.FirstOrDefault(h => h.Name == "From")?.Value;
                        if (string.IsNullOrEmpty(fromHeader))
                        {
                            Interlocked.Increment(ref skippedCount);
                            return;
                        }

                        var match = Regex.Match(fromHeader, @"<(.+?)>");
                        var fullSenderAddress = match.Success ? match.Groups[1].Value : fromHeader;
                        var domain = fullSenderAddress.Split('@').LastOrDefault()?.ToLower();
                        if (string.IsNullOrEmpty(domain))
                        {
                            Interlocked.Increment(ref skippedCount);
                            return;
                        }

                        bool isOpened = (msgResponse.LabelIds == null || !msgResponse.LabelIds.Contains("UNREAD"));
                        bool isUnsubscribable = msgResponse.Payload.Headers
                            .Any(h => h.Name.Equals("List-Unsubscribe", StringComparison.OrdinalIgnoreCase));

                        batchResults.Add((domain, fullSenderAddress, isOpened, isUnsubscribable));
                    };

                foreach (var messageId in chunk)
                {
                    var getRequest = gmailService.Users.Messages.Get("me", messageId);
                    getRequest.Format = UsersResource.MessagesResource.GetRequest.FormatEnum.Metadata;
                    getRequest.Fields = "payload/headers,labelIds";
                    batch.Queue(getRequest, callback);
                }

                await batch.ExecuteAsync();

                await Task.Delay(50);

                foreach (var result in batchResults)
                {
                    if (!senderAnalytics.ContainsKey(result.Domain))
                    {
                        senderAnalytics[result.Domain] = new DomainAnalytics();
                    }
                    var domainAnalytics = senderAnalytics[result.Domain];

                    if (!domainAnalytics.IndividualSenders.TryGetValue(result.FullSenderAddress, out var currentCounts))
                    {
                        currentCounts = new SenderCounts();
                    }

                    currentCounts.Total++;
                    if (result.IsOpened)
                    {
                        currentCounts.Opened++;
                    }
                    currentCounts.IsMailList = currentCounts.IsMailList || result.IsMailList;

                    domainAnalytics.IndividualSenders[result.FullSenderAddress] = currentCounts;
                }

                processedMessages += chunk.Count;
                int progress = (int)((double)processedMessages / totalMessages * 100);
                await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveProgressUpdate", progress);
            }

            // Diagnostic Console Log to see exactly how many items were skipped vs processed
            int totalProcessedSendersCount = senderAnalytics.Values.Sum(v => v.IndividualSenders.Values.Sum(s => s.Total));
            Console.WriteLine($"[Scan Diagnostics] Total Inbox IDs: {totalMessages} | Successfully Processed: {totalProcessedSendersCount} | Skipped Non-Email Items: {skippedCount}");

            var finalResults = senderAnalytics
                .Select(kvp =>
                {
                    var domainAnalytics = kvp.Value;
                    int domainTotal = domainAnalytics.IndividualSenders.Sum(s => s.Value.Total);
                    int domainOpened = domainAnalytics.IndividualSenders.Sum(s => s.Value.Opened);

                    return new SenderAnalyticsDto
                    {
                        Domain = kvp.Key,
                        EmailCount = domainTotal,
                        OpenedCount = domainOpened,
                        OpenedPercent = domainTotal > 0 ? Math.Round((double)domainOpened / domainTotal * 100, 2) : 0,
                        IndividualSenders = domainAnalytics.IndividualSenders.Select(senderKvp => new IndividualSenderDto
                        {
                            Email = senderKvp.Key,
                            EmailCount = senderKvp.Value.Total,
                            OpenedCount = senderKvp.Value.Opened,
                            OpenedPercent = senderKvp.Value.Total > 0 ? Math.Round((double)senderKvp.Value.Opened / senderKvp.Value.Total * 100, 2) : 0,
                            IsMailList = senderKvp.Value.IsMailList
                        }).OrderByDescending(s => s.EmailCount).ToList()
                    };
                })
                .OrderByDescending(dto => dto.EmailCount)
                .ToList();

            await _hubContext.Clients.Client(connectionId).SendAsync("ScanCompleted", finalResults);
        }
        catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.Unauthorized)
        {
            await _hubContext.Clients.Client(connectionId).SendAsync("ScanError", "Your session has expired. Please log in again.");
        }
        catch (TaskCanceledException)
        {
            await _hubContext.Clients.Client(connectionId).SendAsync("ScanError", "The request to Gmail timed out. This can happen during heavy usage. Please try again in a few moments.");
        }
        catch (Exception)
        {
            await _hubContext.Clients.Client(connectionId).SendAsync("ScanError", "An unexpected error occurred during the scan.");
        }
    }
}