using System.Collections.Concurrent;

namespace QuietMail.EmailAnalysis.Service.Models;

public class DomainAnalytics
{
    public ConcurrentDictionary<string, SenderCounts> IndividualSenders { get; set; } = new();
}