namespace QuietMail.EmailAnalysis.Service.Models;

public class SenderAnalyticsDto
{
    public string Sender { get; set; }
    public int TotalEmails { get; set; }
    public int OpenedEmails { get; set; }
}