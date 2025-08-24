using Microsoft.AspNetCore.Mvc;
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
    
    [HttpGet("/gmail")]
    public async Task<IActionResult> GetSenderAnalysis()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            return Unauthorized("Authorization header is missing.");
        }
        
        var accessToken = authHeader.ToString().Split(" ").Last();

        if (string.IsNullOrEmpty(accessToken))
        {
            return Unauthorized("Access token is missing.");
        }

        var res = await _gmailAnalysisService.AnalyzeSendersAsync(accessToken);
        return Ok(res);

    }

}