using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Services;
using Google.Apis.Gmail.v1;

namespace QuietMail.Api.Controllers;


[ApiController]
[Route("auth")]
public class AuthController : Controller
{
    private readonly IConfiguration _configuration;
    private readonly GoogleAuthorizationCodeFlow _flow;
    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
        _flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = new  ClientSecrets
            {
                ClientId = _configuration["Google:ClientId"],
                ClientSecret = _configuration["Google:ClientSecret"]
            },
            Scopes = new[] { "https://www.googleapis.com/auth/gmail.readonly"}
        });
    }
    
    //ENDPOINT 1 - This is the endpoint that the user starts their login processes with 
    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var state = Guid.NewGuid().ToString("N");
        TempData["oauth_state"] = state;
        
        var redirectUri = Url.Action(nameof(GoogleCallback), "Auth", null, protocol: Request.Scheme);
        var request = _flow.CreateAuthorizationCodeRequest(redirectUri);
        request.State = state;
        var authUrl = request.Build();

        return Redirect(authUrl.AbsoluteUri);
    }
    
    //ENDPOINT 2 - This is the endpoint that Google redirects to after the user has logged in
    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback(string code, string state)
    {
        var storedState = TempData["oauth_state"] as string;
    
        if (state != storedState)
        {
            return BadRequest("Invalid state parameter");
        }

        try
        {
            var redirectUri = Url.Action(nameof(GoogleCallback), "Auth", null, Request.Scheme);
            var token = await _flow.ExchangeCodeForTokenAsync(
                "userId",
                code,
                redirectUri,
                CancellationToken.None);
    
            var credential = new UserCredential(_flow, "userId", token);
            var gmailService = new GmailService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "QuietMail"
            });

            string? pageToken = null;
            long inboxCount = 0;

            do
            {
                var request = gmailService.Users.Messages.List("me");
                request.LabelIds = new[] { "INBOX" };
                request.PageToken = pageToken;
                var response = await request.ExecuteAsync();

                if (response.Messages != null)
                    inboxCount += response.Messages.Count;

                pageToken = response.NextPageToken;
            } while (pageToken != null);
        
            var frontendCallbackUrl = $"http://localhost:3000/dashboard?accessToken={token.AccessToken}&emailCount={inboxCount}";
            return Redirect(frontendCallbackUrl);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
    
    
}