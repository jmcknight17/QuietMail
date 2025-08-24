namespace QuietMail.Api.Models;

public class SenderAnalyticsDto
{
    public string SenderEmail { get; set; }
    public int EmailCount { get; set; }
    public int OpenedCount { get; set; }
    public double OpenRate { get; set; }
}