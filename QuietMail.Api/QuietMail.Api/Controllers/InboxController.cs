using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Microsoft.AspNetCore.Mvc;
using QuietMail.Api.Interfaces;
using QuietMail.Api.Models;
using QuietMail.EmailAnalysis.Service.Services;
using Microsoft.Extensions.DependencyInjection;

namespace QuietMail.Api.Controllers;
[ApiController]
[Route("inbox")]
public class InboxController : ControllerBase 
{
    //TODO: Implement Logging 
    private readonly IServiceProvider _serviceProvider;

    public InboxController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [HttpPost("trash-emails-from-senders")] 
    public async Task<IActionResult> TrashEmailsFromSenders([FromBody] InboxActionRequest request)
    {
        if (request == null || !request.senders.Any())
        {
            return BadRequest("No sender emails provided for trashing.");
        }
        var provider = request.providerType;

        if (!Request.Headers.TryGetValue("Authorization", out var authorization))
        {
            return Unauthorized("Missing Authorization header");
        }
        var accessToken = authorization.ToString().Split(" ").Last();
        if (string.IsNullOrEmpty(accessToken))
        {
            return Unauthorized("Access token is missing.");
        }
        try
        {
            var service = _serviceProvider.GetKeyedService<IEmailProvider>(provider);
            await service.TrashAllEmailsFromSendersAsync(accessToken, request.senders);
            return Ok();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error trashing emails: {ex.Message}");
            return StatusCode(500, new { message = "Failed to move emails to trash.", error = ex.Message });
        }
    }

    [HttpPost("unsubscribeSenders")]
    public async Task<IActionResult> UnsubscribeSenders([FromBody] InboxActionRequest request)
    {
        var senders = request.senders;
        if (senders == null || !senders.Any())
            return BadRequest("No sender emails provided for unsubscribing.");

        var provider = request.providerType;

        if (!Request.Headers.TryGetValue("Authorization", out var authorization))   
            return Unauthorized("Missing Authorization header");
        
        var accessToken = authorization.ToString().Split(" ").Last();
        if (string.IsNullOrEmpty(accessToken))
            return Unauthorized("Access token is missing.");

        try
        {
            var service = _serviceProvider.GetKeyedService<IEmailProvider>(provider);
            await service.UnsubscribeFromSendersAsync(accessToken, senders);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to unsubscribe from senders.", error = ex.Message });
        }
    }
}