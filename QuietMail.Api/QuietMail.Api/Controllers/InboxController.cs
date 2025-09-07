using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Microsoft.AspNetCore.Mvc;
using QuietMail.EmailAnalysis.Service.Services;

namespace QuietMail.Api.Controllers;
[ApiController]
[Route("inbox")]
public class InboxController : Controller 
{
    private readonly ManageInboxService _manageInboxService;

    public InboxController(ManageInboxService manageInboxService)
    {
        _manageInboxService = manageInboxService;
    }

    [HttpDelete("delete-emails-from-single-sender/{senderEmail}")]
    public async Task<IActionResult> DeleteEmailsFromSingleSender(string senderEmail)
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
        await _manageInboxService.DeleteAllEmailsFromSenderAsync(accessToken, senderEmail);
        return Ok();
    }
}