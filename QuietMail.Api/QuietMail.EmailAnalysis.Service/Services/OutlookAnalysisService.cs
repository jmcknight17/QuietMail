using QuietMail.Api.Interfaces;

namespace QuietMail.EmailAnalysis.Service.Services;

public class OutlookAnalysisService : IEmailProvider
{
    public ProviderType ProviderName => ProviderType.Outlook;
    public Task TrashAllEmailsFromSendersAsync(string accessToken, List<string> senders)
    {
        throw new NotImplementedException();
    }

    public Task TrashEmailsFromSenders(string accessToken, List<string> senders)
    {
        throw new NotImplementedException();
    }

    public Task UnsubscribeFromSendersAsync(string accessToken, List<string> senders)
    {
        throw new NotImplementedException();
    }
    public Task UnsubscribeSenders(string accessToken, List<string> senders)
    {
        throw new NotImplementedException();
    }
}