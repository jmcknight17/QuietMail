using Google.Apis.Auth.OAuth2;
using Google.Apis.Gmail.v1;
using Google.Apis.Gmail.v1.Data;
using Google.Apis.Services;

namespace QuietMail.EmailAnalysis.Service.Services;

public class ManageInboxService
{
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
                var batchRequest =  new BatchModifyMessagesRequest()
                {
                    Ids = messageIds.ToList(),
                    AddLabelIds = new List<string>{"TRASH"},
                    RemoveLabelIds = new List<string>{"INBOX"}
                }; 
            
                var deleteRequest = gmailService.Users.Messages.BatchModify(batchRequest, "me");
                await deleteRequest.ExecuteAsync();
            }
        }
        
    }
}