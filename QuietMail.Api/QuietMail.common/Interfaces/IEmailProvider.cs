using QuietMail.common;

namespace QuietMail.Api.Interfaces;
public interface IEmailProvider
{
    ProviderType ProviderName{get;}
    Task TrashEmailsFromSenders(string accessToken, List<string> senders);
    Task UnsubscribeSenders(string accessToken, List<string> senders);
    Task TrashAllEmailsFromSendersAsync(string accessToken, List<string> senders);
    Task UnsubscribeFromSendersAsync(string accessToken, List<string> senders);
}