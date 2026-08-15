namespace QuietMail.Api.Models;

public class InboxActionRequest
{
    public ProviderType providerType {get; set;}
    public List<string> senders {get;set;}
}