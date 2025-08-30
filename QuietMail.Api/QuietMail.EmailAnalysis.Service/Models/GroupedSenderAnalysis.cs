namespace QuietMail.EmailAnalysis.Service.Models;

public class GroupedSenderAnalysis
{
    public int Total { get; set; }
    public double PercentOpened { get; set; }
    public int OpenedCount { get; set; }
    public List<IndividualSenderAnalysis> IndividualSenders { get; set; }
}

public class IndividualSenderAnalysis
{
    public string Email { get; set; }
    public int Total { get; set; }
    public double PercentOpened { get; set; }
    public int OpenedCount { get; set; }
}