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

public class GmailAnalysisService : IEmailActionService

{
    private readonly IHubContext<ProgressHub> _hubContext;
    private readonly HttpClient _httpClient;

    public GmailAnalysisService(IHubContext<ProgressHub> hubContext, HttpClient httpClient)
    {
        _hubContext = hubContext;
        _httpClient = httpClient;
    }

    public ProviderType ProviderName => ProviderType.Gmail;



    public async Task<int> TrashEmailsFromSendersAsync(string accessToken, List<string> senderEmail)
    {
        var credential = GoogleCredential.FromAccessToken(accessToken);
        var gmailService = new GmailService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "QuietMail"
        });

        int totalDeleted = 0;

        foreach (var sender in senderEmail)
        {
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

                totalDeleted += messageIds.Count;
            }
        }
        return totalDeleted;
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

    public async Task<int> UnsubscribeAndTrashEmailsFromSendersAsync(string accessToken, List<string> senders)
    {
        await UnsubscribeFromSendersAsync(accessToken, senders);
        return await TrashEmailsFromSendersAsync(accessToken, senders);
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


    
}