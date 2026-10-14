using Microsoft.AspNetCore.Mvc;
using QuietMail.Api.Models;

namespace QuietMail.Api.Controllers;
[ApiController]
[Route("inbox/{provider}")]
public class InboxController : ControllerBase 
{
    public readonly IProviderHelper _providerHelper;

    public InboxController(IProviderHelper providerHelper)
    {
        _providerHelper = providerHelper;
    }

    [HttpPost("trash-emails-from-senders")] 
    public async Task<IActionResult> TrashEmailsFromSenders([FromRoute] string provider, [FromBody] InboxActionRequest request)
    { 
        if (!Request.Cookies.TryGetValue("accessToken", out var accessToken) )
            return Unauthorized(new { isAuthenticated = false, message = "No active session" });  

        try
        {
            var service = _providerHelper.GetEmailActionServiceFromRouteString(provider);

            if (service is null)
                return BadRequest($"No email action service found for provider: {provider}");
            
            var result = await service.TrashEmailsFromSendersAsync(accessToken, request.senders);

            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error trashing emails: {ex.Message}");
            return StatusCode(500, new { message = "Failed to move emails to trash.", error = ex.Message });
        }
    }

    [HttpPost("unsubscribeSenders")]
    public async Task<IActionResult> UnsubscribeSenders([FromRoute] string provider, [FromBody] InboxActionRequest request)
    {
        var senders = request.senders;
        if (senders == null || !senders.Any())
            return BadRequest("No sender emails provided for unsubscribing.");

        if (!Request.Headers.TryGetValue("Authorization", out var authorization))   
            return Unauthorized("Missing Authorization header");
        
        var accessToken = authorization.ToString().Split(" ").Last();
        if (string.IsNullOrEmpty(accessToken))
            return Unauthorized("Access token is missing.");

        try
        {
            var service = _providerHelper.GetEmailActionServiceFromRouteString(provider);
            
            if (service is null)
                return BadRequest($"No email action service found for provider: {provider}");

            await service.UnsubscribeFromSendersAsync(accessToken, senders);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to unsubscribe from senders.", error = ex.Message });
        }
    }

    [HttpPost("trashAndUnsubscribeSenders")]
    public async Task<IActionResult> TrashAndUnsubscribeSenders([FromRoute] string provider, [FromBody] InboxActionRequest request)
    {
        var senders = request.senders;
        if (senders == null || !senders.Any())
            return BadRequest("No sender emails provided for trashing and unsubscribing.");

        if (!Request.Cookies.TryGetValue("accessToken", out var accessToken) )
            return Unauthorized(new { isAuthenticated = false, message = "No active session" });  

        try
        {
            var service = _providerHelper.GetEmailActionServiceFromRouteString(provider);
            
            if (service is null)
                return BadRequest($"No email action service found for provider: {provider}");
            
            var result = await service.UnsubscribeAndTrashEmailsFromSendersAsync(accessToken, senders);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to trash and unsubscribe from senders.", error = ex.Message });
        }
    }
}