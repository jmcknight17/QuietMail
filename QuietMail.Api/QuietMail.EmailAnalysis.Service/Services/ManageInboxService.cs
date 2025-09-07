using Google.Apis.Auth.OAuth2;
using Google.Apis.Gmail.v1;
using Google.Apis.Services;

namespace QuietMail.EmailAnalysis.Service.Services;

public class ManageInboxService
{
    public async Task DeleteAllEmailsFromSenderAsync(string accessToken, string senderEmail)
    {
        var credential = GoogleCredential.FromAccessToken(accessToken);
        var gmailService = new GmailService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "QuietMail"
        });
        
        //Step 1: Search for all emails from the specified sender
        string? pageToken = null;
        List<string> messageIds = new List<string>();
        do
        {
            var countRequest = gmailService.Users.Messages.List("me");
            countRequest.LabelIds = new[] { "INBOX" };
            countRequest.Q = $"from:{senderEmail}";
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
        
        //Step 2: Delete the found emails
        var batchRequest = new Google.Apis.Gmail.v1.Data.BatchDeleteMessagesRequest
        {
            Ids = messageIds.Select(id => id.ToString()).ToList()
        };
        var deleteRequest = gmailService.Users.Messages.BatchDelete(batchRequest, "me");
        await deleteRequest.ExecuteAsync();
        //Gmail doesn't return the number of deleted emails :( 
    }
}