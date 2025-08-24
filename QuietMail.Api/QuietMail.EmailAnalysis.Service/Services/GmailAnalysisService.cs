using System.Text.RegularExpressions;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Gmail.v1;
using Google.Apis.Services;
using QuietMail.EmailAnalysis.Service.Models;

namespace QuietMail.EmailAnalysis.Service.Services;

public class GmailAnalysisService
{
       public async Task<List<SenderAnalyticsDto>> AnalyzeSendersAsync(string accessToken)
{
    var credential = GoogleCredential.FromAccessToken(accessToken);
    var gmailService = new GmailService(new BaseClientService.Initializer
    {
        HttpClientInitializer = credential,
        ApplicationName = "QuietMail"
    });

    var senderAnalytics = new Dictionary<string, (int Total, int Opened)>();
    string nextPageToken = null;

    do
    {
        var listRequest = gmailService.Users.Messages.List("me");
        listRequest.PageToken = nextPageToken;
        listRequest.Fields = "messages(id),nextPageToken"; 
        listRequest.LabelIds = "INBOX";
        listRequest.Q = "-label:chat";
        var listResponse = await listRequest.ExecuteAsync();

        if (listResponse.Messages == null) break;

        foreach (var message in listResponse.Messages)
        {
            var getRequest = gmailService.Users.Messages.Get("me", message.Id);
            getRequest.Format = UsersResource.MessagesResource.GetRequest.FormatEnum.Metadata;
            getRequest.Fields = "payload/headers,labelIds"; 
            var msgResponse = await getRequest.ExecuteAsync();

            var fromHeader = msgResponse.Payload.Headers.FirstOrDefault(h => h.Name == "From")?.Value;
            if (string.IsNullOrEmpty(fromHeader)) continue;

            var match = Regex.Match(fromHeader, @"<(.+?)>");
            var sender = match.Success ? match.Groups[1].Value : fromHeader;

            senderAnalytics.TryGetValue(sender, out var currentAnalytics);

            int total = currentAnalytics.Total + 1;
            
            int opened = currentAnalytics.Opened + 
                         (msgResponse.LabelIds != null && msgResponse.LabelIds.Contains("UNREAD") ? 0 : 1);

            senderAnalytics[sender] = (total, opened);
        }
        nextPageToken = listResponse.NextPageToken;
    } while (!string.IsNullOrEmpty(nextPageToken));

    return senderAnalytics
        .Select(kvp => new SenderAnalyticsDto
        {
            Sender = kvp.Key,
            TotalEmails = kvp.Value.Total,
            OpenedEmails = kvp.Value.Opened
        })
        .OrderByDescending(dto => dto.TotalEmails)
        .ToList();
}
}