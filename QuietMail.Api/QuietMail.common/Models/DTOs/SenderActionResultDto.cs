public class SenderActionResultDto
{
    public string Email {get;set;} = string.Empty;
    public bool Unsubscribed {get;set;}
    public bool Trashed {get;set;}
    public string? UnsubscribedError {get;set;}
    public string? TrashedError {get;set;}
}