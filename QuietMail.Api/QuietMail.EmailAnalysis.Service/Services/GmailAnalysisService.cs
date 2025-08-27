using System.Text.RegularExpressions;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Gmail.v1;
using Google.Apis.Requests;
using Google.Apis.Services;
using Microsoft.AspNetCore.SignalR;
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
    var credential = GoogleCredential.FromAccessToken(accessToken);
    var gmailService = new GmailService(new BaseClientService.Initializer
    {
        HttpClientInitializer = credential,
        ApplicationName = "QuietMail"
    });

    var senderAnalytics = new Dictionary<string, (int Total, int Opened)>();
    long processedMessages = 0;

    
    long totalMessages = 0;
    string pageTokenForCount = null;
    do
    {
        var countRequest = gmailService.Users.Messages.List("me");
        countRequest.LabelIds = new[] { "INBOX" };
        countRequest.Q = "-label:chat"; 
        countRequest.PageToken = pageTokenForCount;
        var countResponse = await countRequest.ExecuteAsync();

        if (countResponse.Messages != null)
        {
            totalMessages += countResponse.Messages.Count;
        }
        pageTokenForCount = countResponse.NextPageToken;
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

        
        var batch = new BatchRequest(gmailService);
        BatchRequest.OnResponse<Google.Apis.Gmail.v1.Data.Message> callback = (msgResponse, error, index, message) =>
        {
            if (error != null) return;

            var fromHeader = msgResponse.Payload.Headers.FirstOrDefault(h => h.Name == "From")?.Value;
            if (string.IsNullOrEmpty(fromHeader)) return;
            
            var match = Regex.Match(fromHeader, @"<(.+?)>");
            var sender = match.Success ? match.Groups[1].Value : fromHeader;

            senderAnalytics.TryGetValue(sender, out var currentAnalytics);
            int total = currentAnalytics.Total + 1;
            int opened = currentAnalytics.Opened + (msgResponse.LabelIds != null && msgResponse.LabelIds.Contains("UNREAD") ? 0 : 1);
            senderAnalytics[sender] = (total, opened);
        };

        foreach (var message in listResponse.Messages)
        {
            var getRequest = gmailService.Users.Messages.Get("me", message.Id);
            getRequest.Format = UsersResource.MessagesResource.GetRequest.FormatEnum.Metadata;
            getRequest.Fields = "payload/headers,labelIds";
            batch.Queue(getRequest, callback);
        }

        await batch.ExecuteAsync();

        processedMessages += listResponse.Messages.Count;
        int progress = (int)((double)processedMessages / totalMessages * 100);
        await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveProgressUpdate", progress);

        nextPageToken = listResponse.NextPageToken;
        
    } while (!string.IsNullOrEmpty(nextPageToken));

    var finalResults = senderAnalytics
        .Select(kvp => new SenderAnalyticsDto
        {
            Sender = kvp.Key,
            TotalEmails = kvp.Value.Total,
            OpenedEmails = kvp.Value.Opened
        })
        .OrderByDescending(dto => dto.TotalEmails)
        .ToList();
        
    await _hubContext.Clients.Client(connectionId).SendAsync("ScanCompleted", finalResults);
}
}