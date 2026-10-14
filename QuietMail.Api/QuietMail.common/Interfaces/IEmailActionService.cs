using QuietMail.common;

namespace QuietMail.Api.Interfaces;
public interface IEmailActionService
{
    ProviderType ProviderName{get;}
    Task<TrashEmailResultDto> TrashEmailsFromSendersAsync(string accessToken, List<string> senders);
    Task<UnsubscribeSenderDto> UnsubscribeFromSendersAsync(string accessToken, List<string> senders);
    Task<UnsubscribeSenderDto> UnsubscribeAndTrashEmailsFromSendersAsync(string accessToken, List<string> senders);
}