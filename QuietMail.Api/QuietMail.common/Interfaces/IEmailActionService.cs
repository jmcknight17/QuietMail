using QuietMail.common;

namespace QuietMail.Api.Interfaces;
public interface IEmailActionService
{
    ProviderType ProviderName{get;}
    Task<int> TrashEmailsFromSendersAsync(string accessToken, List<string> senders);
    Task UnsubscribeFromSendersAsync(string accessToken, List<string> senders);
    Task<int> UnsubscribeAndTrashEmailsFromSendersAsync(string accessToken, List<string> senders);
}