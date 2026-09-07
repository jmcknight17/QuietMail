using Microsoft.AspNetCore.Mvc;
using QuietMail.Api.Models;
using QuietMail.EmailAnalysis.Service.Services;

namespace QuietMail.Api.Controllers;

[ApiController]
[Route("sender-analysis/{provider}")]
public class SenderAnalysisController : ControllerBase
{
    private readonly IProviderHelper _providerHelper;

    public SenderAnalysisController(IProviderHelper providerHelper)
    {
        _providerHelper = providerHelper;
    }

    [HttpPost("start-scan")]
    public async Task<IActionResult> StartScan([FromRoute] string provider, [FromBody] ScanRequest request)
    {
        try
        {
            if (!Request.Headers.TryGetValue("Authorization", out var authorization))
                return Unauthorized("Missing Authorization header");

            var accessToken = authorization.ToString().Split(" ").Last();
            
            if (string.IsNullOrEmpty(accessToken))
                return Unauthorized("Access token is missing.");

            var anyalysisService = _providerHelper.GetScanServiceFromRouteString(provider);

            if (anyalysisService is null)
                return BadRequest($"No scan service found for provider: {provider}");

            await anyalysisService.StartScanAsync(accessToken, request.ConnectionId);

            return Accepted();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to start scan.", error = ex.Message });
        }

    }

}