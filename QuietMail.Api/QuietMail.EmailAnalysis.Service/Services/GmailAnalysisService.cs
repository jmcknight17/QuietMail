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

namespace QuietMail.EmailAnalysis.Service.Services;

public class GmailAnalysisService
{
    private readonly IHubContext<ProgressHub> _hubContext;

    public GmailAnalysisService(IHubContext<ProgressHub> hubContext)
    {
        _hubContext = hubContext;
    }

      public async Task AnalyzeSendersAsync(string accessToken, string connectionId)
    {
        try
        {
            var credential = GoogleCredential.FromAccessToken(accessToken);
            var gmailService = new GmailService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "QuietMail"
            });

            var senderAnalytics = new Dictionary<string, DomainAnalytics>();
            long processedMessages = 0;
            long totalMessages = 0;
            string pageTokenForCount = null;
            do // First do-while loop to count total messages
            {
                var countRequest = gmailService.Users.Messages.List("me");
                countRequest.LabelIds = new[] { "INBOX" };
                countRequest.Q = "-label:chat";
                countRequest.PageToken = pageTokenForCount;

                var cancellationTokenSource = new CancellationTokenSource(TimeSpan.FromSeconds(60));
                var countResponse = await countRequest.ExecuteAsync(cancellationTokenSource.Token);

                if (countResponse.Messages != null)
                {
                    totalMessages += countResponse.Messages.Count;
                }
                pageTokenForCount = countResponse.NextPageToken;
                await Task.Delay(50); // Be respectful of API rate limits
                
            } while (pageTokenForCount != null);

            if (totalMessages == 0)
            {
                await _hubContext.Clients.Client(connectionId).SendAsync("ScanCompleted", new List<SenderAnalyticsDto>());
                return;
            }
            
            string nextPageToken = null;
            do
            {
                var listRequest = gmailService.Users.Messages.List("me");
                listRequest.PageToken = nextPageToken;
                listRequest.Fields = "messages(id),nextPageToken";
                listRequest.LabelIds = "INBOX";
                listRequest.Q = "-label:chat";
                var listResponse = await listRequest.ExecuteAsync();

                if (listResponse.Messages == null || !listResponse.Messages.Any()) break;
                
                //Concurrentbag required as google batch requests are processed in parallel
                var batchResults = new ConcurrentBag<(string Domain, string FullSenderAddress, bool IsOpened)>();

                var batch = new BatchRequest(gmailService);
                BatchRequest.OnResponse<Google.Apis.Gmail.v1.Data.Message> callback =
                    (msgResponse, error, index, message) =>
                    {
                        if (error != null || msgResponse?.Payload?.Headers == null) return;

                        var fromHeader = msgResponse.Payload.Headers.FirstOrDefault(h => h.Name == "From")?.Value;
                        if (string.IsNullOrEmpty(fromHeader)) return;

                        var match = Regex.Match(fromHeader, @"<(.+?)>");
                        var fullSenderAddress = match.Success ? match.Groups[1].Value : fromHeader;
                        var domain = fullSenderAddress.Split('@').LastOrDefault()?.ToLower();
                        if (string.IsNullOrEmpty(domain)) return;
                        
                        bool isOpened = (msgResponse.LabelIds == null || !msgResponse.LabelIds.Contains("UNREAD"));
                        
                        batchResults.Add((domain, fullSenderAddress, isOpened));
                    };

                foreach (var message in listResponse.Messages)
                {
                    var getRequest = gmailService.Users.Messages.Get("me", message.Id);
                    getRequest.Format = UsersResource.MessagesResource.GetRequest.FormatEnum.Metadata;
                    getRequest.Fields = "payload/headers,labelIds";
                    batch.Queue(getRequest, callback);
                }

                await batch.ExecuteAsync();
                
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
                    
                    domainAnalytics.IndividualSenders[result.FullSenderAddress] = currentCounts;
                }

                processedMessages += listResponse.Messages.Count;
                int progress = (int)((double)processedMessages / totalMessages * 100);
                await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveProgressUpdate", progress);

                nextPageToken = listResponse.NextPageToken;
            } while (!string.IsNullOrEmpty(nextPageToken));
            
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
                            OpenedPercent = senderKvp.Value.Total > 0 ? Math.Round((double)senderKvp.Value.Opened / senderKvp.Value.Total * 100, 2) : 0
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