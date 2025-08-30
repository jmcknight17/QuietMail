namespace QuietMail.Api.Models;

public class SenderAnalyticsDto
{
    public string Domain { get; set; }
    public List<IndividualSenderDto> IndividualSenders { get; set; } 
    public int EmailCount { get; set; }
    public int OpenedCount { get; set; }
    public double OpenedPercent { get; set; }
}

public class IndividualSenderDto
{
    public string Email { get; set; }
    public int EmailCount { get; set; }
    public int OpenedCount { get; set; }
    public double OpenedPercent { get; set; }
}

