using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;

namespace QuietMail.Api.Controllers;


[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly GoogleAuthorizationCodeFlow _flow;
    //Constructor with the codeFlow (The heart and soul of the OAuth2.0 dance)
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
            Scopes = new []{"https://www.googleapis.com/auth/gmail.metadata"} 
        });
    }
    
    //ENDPOINT 1 - This is the endpoint that the user starts their login processes with 
    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var redirectUri = Url.Action(nameof(GoogleCallback), "Auth", null, Request.Scheme);
        var authUrl = _flow.CreateAuthorizationCodeRequest(redirectUri).Build();
        
        return Redirect(authUrl.AbsoluteUri);
    }
    
    //ENDPOINT 2 - This is the endpoint that Google redirects to after the user has logged in
    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback(string code, string state)
    {
        var redirectUri = Url.Action(nameof(GoogleCallback), "Auth", null, Request.Scheme);
        var token = await _flow.ExchangeCodeForTokenAsync(
            "userId",
            code,
            redirectUri,
            CancellationToken.None);
        
        return Ok(new { message = "Successfully authenticated!", accessToken = token.AccessToken });
    }
    
    
}