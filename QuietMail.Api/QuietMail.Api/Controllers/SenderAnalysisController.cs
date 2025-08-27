using Microsoft.AspNetCore.Mvc;
using QuietMail.Api.Models;
using QuietMail.EmailAnalysis.Service.Services;

namespace QuietMail.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class SenderAnalysisController : ControllerBase
{
    private GmailAnalysisService _gmailAnalysisService;
    
    public SenderAnalysisController(GmailAnalysisService gmailAnalysisService)
    {
        _gmailAnalysisService = gmailAnalysisService;
    }
    
    [HttpPost("/start-scan")]
    public IActionResult StartScan([FromBody] ScanRequest request)
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authorization))
        {
            return Unauthorized("Missing Authorization header");
        }
        var accessToken = authorization.ToString().Split(" ").Last();
        if (string.IsNullOrEmpty(accessToken))
        {
            return Unauthorized("Access token is missing.");
        }
        _ = _gmailAnalysisService.AnalyzeSendersAsync(accessToken, request.ConnectionId);
        
        return Accepted();
    }

}