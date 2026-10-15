public class BatchedSenderActionDto
{
    public int TotalEmailsTrashed { get; set; }
    public int TotalSendersUnsubscribed { get; set; }
    public int TotalSendersRequested { get; set; }
    public List<SenderActionResultDto> Details { get; set; } = new();
    public bool HasErrors => Details.Any(d => !string.IsNullOrEmpty(d.UnsubscribedError) || !string.IsNullOrEmpty(d.TrashedError));
}