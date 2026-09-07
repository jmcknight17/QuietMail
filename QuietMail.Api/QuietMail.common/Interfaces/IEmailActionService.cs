using QuietMail.common;

namespace QuietMail.Api.Interfaces;
public interface IEmailActionService
{
    ProviderType ProviderName{get;}
    Task AnalyzeSendersAsync(string accessToken, string connectionId);
    Task TrashEmailsFromSenders(string accessToken, List<string> senders);
    Task UnsubscribeSenders(string accessToken, List<string> senders);
    Task TrashAllEmailsFromSendersAsync(string accessToken, List<string> senders);
    Task UnsubscribeFromSendersAsync(string accessToken, List<string> senders);
}