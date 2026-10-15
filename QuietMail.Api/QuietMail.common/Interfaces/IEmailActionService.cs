using QuietMail.common;

namespace QuietMail.Api.Interfaces;
public interface IEmailActionService
{
    ProviderType ProviderName{get;}
    Task<BatchedSenderActionDto> TrashEmailsFromSendersAsync(string accessToken, List<string> senders);
    Task<BatchedSenderActionDto> UnsubscribeFromSendersAsync(string accessToken, List<string> senders);
    Task<BatchedSenderActionDto> UnsubscribeAndTrashEmailsFromSendersAsync(string accessToken, List<string> senders);
}