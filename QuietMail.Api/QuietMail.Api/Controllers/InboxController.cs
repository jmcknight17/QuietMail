﻿using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Microsoft.AspNetCore.Mvc;
using QuietMail.EmailAnalysis.Service.Services;

namespace QuietMail.Api.Controllers;
[ApiController]
[Route("inbox")]
public class InboxController : Controller 
{
    //TODO: Implement Logging 
    private readonly ManageInboxService _manageInboxService;

    public InboxController(ManageInboxService manageInboxService)
    {
        _manageInboxService = manageInboxService;
    }

    [HttpPost("trash-emails-from-senders")] 
    public async Task<IActionResult> TrashEmailsFromSenders([FromBody] List<string> request)
    {
        if (request == null || !request.Any())
        {
            return BadRequest("No sender emails provided for trashing.");
        }

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
            await _manageInboxService.TrashAllEmailsFromSendersAsync(accessToken, request);
            return Ok();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error trashing emails: {ex.Message}");
            return StatusCode(500, new { message = "Failed to move emails to trash.", error = ex.Message });
        }
    }

    [HttpPost("unsubscribe-senders")]
    public async Task<IActionResult> UnsubscribeSenders([FromBody] List<string>? senders)
    {
        if (senders == null || !senders.Any())
            return BadRequest("No sender emails provided for unsubscribing.");

        if (!Request.Headers.TryGetValue("Authorization", out var authorization))   
            return Unauthorized("Missing Authorization header");
        
        var accessToken = authorization.ToString().Split(" ").Last();
        if (string.IsNullOrEmpty(accessToken))
            return Unauthorized("Access token is missing.");

        try
        {
            await _manageInboxService.UnsubscribeFromSendersAsync(accessToken, senders);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to unsubscribe from senders.", error = ex.Message });
        }
    }
}