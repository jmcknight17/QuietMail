using System.Collections.Concurrent;
using System.Net;
using System.Text.RegularExpressions;
using Google;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Gmail.v1;
using Google.Apis.Requests;
using Google.Apis.Services;
using Microsoft.AspNetCore.SignalR;
using QuietMail.Api.Interfaces;
using QuietMail.Api.Models;
using QuietMail.common.Hubs;
using QuietMail.EmailAnalysis.Service.Models;
using Google.Apis.Gmail.v1.Data;

namespace QuietMail.EmailAnalysis.Service.Services;

public class GmailAnalysisService : IEmailProvider

{
    private readonly IHubContext<ProgressHub> _hubContext;
    private readonly HttpClient _httpClient;

    public GmailAnalysisService(IHubContext<ProgressHub> hubContext, HttpClient httpClient)
    {
        _hubContext = hubContext;
        _httpClient = httpClient;
    }

    public ProviderType ProviderName => ProviderType.Gmail;

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
                await Task.Delay(50); // Be respectful of API rate limits (Look up how to setup rate limiting for my api)
                
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
                var batchResults = new ConcurrentBag<(string Domain, string FullSenderAddress, bool IsOpened, bool IsMailList)>();

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
                        bool isUnsubscribable = msgResponse.Payload.Headers
                            .Any(h => h.Name.Equals("List-Unsubscribe", StringComparison.OrdinalIgnoreCase));
                        batchResults.Add((domain, fullSenderAddress, isOpened,  isUnsubscribable));
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
                    
                    currentCounts.IsMailList = currentCounts.IsMailList || result.IsMailList; 

                    
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

    public async Task TrashAllEmailsFromSendersAsync(string accessToken, List<string> senderEmail)
    {
        var credential = GoogleCredential.FromAccessToken(accessToken);
        var gmailService = new GmailService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "QuietMail"
        });

        foreach (var sender in senderEmail)
        {
            //Step 1: Search for all emails from the specified sender
            string? pageToken = null;
            List<string> messageIds = new List<string>();
            do
            {
                var countRequest = gmailService.Users.Messages.List("me");
                countRequest.LabelIds = new[] { "INBOX" };
                countRequest.Q = $"from:{sender}";
                countRequest.PageToken = pageToken;

                var cancellationTokenSource = new CancellationTokenSource(TimeSpan.FromSeconds(15));
                var countResponse = await countRequest.ExecuteAsync(cancellationTokenSource.Token);
                if (countResponse.Messages != null)
                {
                    messageIds.AddRange(countResponse.Messages.Select(m => m.Id));
                }

                pageToken = countResponse.NextPageToken;
                await Task.Delay(50);
            } while (pageToken != null);

            //Step 2: Add a new label "TRASH" and remove the "INBOX" label to effectively delete the emails
            if (messageIds.Any())
            {
                var batchRequest = new BatchModifyMessagesRequest()
                {
                    Ids = messageIds.ToList(),
                    AddLabelIds = new List<string> { "TRASH" },
                    RemoveLabelIds = new List<string> { "INBOX" }
                };

                var deleteRequest = gmailService.Users.Messages.BatchModify(batchRequest, "me");
                await deleteRequest.ExecuteAsync();
            }
        }
    }

    public async Task UnsubscribeFromSendersAsync(string accessToken, List<string> senders)
    {
        var credential = GoogleCredential.FromAccessToken(accessToken);
        var gmailService = new GmailService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "QuietMail"
        });

        try
        {
            foreach (var senderEmail in senders)
            {
                var listRequest = gmailService.Users.Messages.List("me");
                listRequest.Q = $"from:\"{senderEmail}\" has:list-unsubscribe -label:spam -label:trash";
                listRequest.LabelIds = new[] { "INBOX" };
                listRequest.MaxResults = 1;
                
                var listResponse = await listRequest.ExecuteAsync();
                var messages = listResponse.Messages;
                if (messages == null || !messages.Any())
                    throw new Exception("No messages found.");
                var messageId = listResponse.Messages?.FirstOrDefault()?.Id;

                if (string.IsNullOrEmpty(messageId))
                {
                    throw new InvalidOperationException($"No recent unsubscribable email found from {senderEmail} with 'List-Unsubscribe' header.");
                }

                var message = await gmailService.Users.Messages.Get(messageId, messageId).ExecuteAsync();
                if (message.Payload?.Headers == null)
                {
                    throw new InvalidOperationException($"Email with ID {messageId} has no headers.");
                }
                var listUnsubscribeHeader = message.Payload.Headers
                    .FirstOrDefault(h => h.Name.Equals("List-Unsubscribe", StringComparison.OrdinalIgnoreCase))?.Value;
                
                var unsubscribeUrls = await GetUnsubscribeUrlsAsync(listUnsubscribeHeader);
                if (unsubscribeUrls == null || !unsubscribeUrls.Any())
                    throw new Exception("No unsubscribe URLs found in the 'List-Unsubscribe' header.");
                
                string bestHttpLink = null;
                HttpMethod httpMethod = HttpMethod.Get;

                // Simple heuristic to prefer POST
                bestHttpLink = unsubscribeUrls.FirstOrDefault(link => IsLikelyHttpPost(link));
                
                if (bestHttpLink != null)
                    httpMethod = HttpMethod.Post;
                else
                    bestHttpLink = unsubscribeUrls.FirstOrDefault(); 

                if (string.IsNullOrEmpty(bestHttpLink))
                    throw new InvalidOperationException($"Failed to select an HTTP unsubscribe link for {senderEmail}.");

                await UnsubscribeViaHttp(bestHttpLink, httpMethod);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during unsubscribe process: {ex.Message}");
            throw;
        }
    }

    private async Task<List<string>> GetUnsubscribeUrlsAsync(string? headerValue)
    {
        var links = new List<string>();
        var matches = Regex.Matches(headerValue, @"<(mailto:[^>]+|https?:\/\/[^>]+)>");
        foreach (Match match in matches)
        {
            links.Add(match.Groups[1].Value);
        }
        return links;
    }
    
    private bool IsLikelyHttpPost(string url)
    {
        return url.Contains("post", StringComparison.OrdinalIgnoreCase) ||
               url.Contains("confirm", StringComparison.OrdinalIgnoreCase) ||
               url.Contains("unsubscribe_confirm", StringComparison.OrdinalIgnoreCase);
    }
    
    private async Task UnsubscribeViaHttp(string url, HttpMethod method)
    {
        HttpRequestMessage request = new HttpRequestMessage(method, url);
        request.Headers.Add("User-Agent", "QuietMail-Unsubscribe-Service/1.0");

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        //TODO: Maybe log the response or handle it further
    }

    public Task TrashEmailsFromSenders(string accessToken, List<string> senders)
    {
        throw new NotImplementedException();
    }

    public Task UnsubscribeSenders(string accessToken, List<string> senders)
    {
        throw new NotImplementedException();
    }

    
}