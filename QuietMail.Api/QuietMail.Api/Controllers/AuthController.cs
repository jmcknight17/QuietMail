using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;


namespace QuietMail.Api.Controllers;


[ApiController]
[Route("auth/{provider}")]
public class AuthController : Controller
{
    private readonly IServiceProvider _serviceProvider; 
    public AuthController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }
    
    //ENDPOINT 1 - This is the endpoint that the user starts their login processes with 
    [HttpGet("login")]
    public async Task<IActionResult> GoogleLogin([FromRoute] string provider)
    {
        try
        {
            var authService = GetAuthServiceFromProvider(provider);   
            var redirectUri = Url.Action(nameof(Callback), "Auth", null, protocol: Request.Scheme);
            
            if (string.IsNullOrEmpty(redirectUri))
                return BadRequest("Failed to build the redirect URI");

            var state = Guid.NewGuid().ToString("N");
            TempData[$"oauth_state_{provider.ToLowerInvariant()}"] = state;

            var url  = await authService.GetUrlAsync(redirectUri, state);

            return Redirect(url);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    //ENDPOINT 2 - This is the endpoint that Google redirects to after the user has logged in
    [HttpGet("callback")]
    public async Task<IActionResult> Callback([FromRoute] string provider, 
        [FromQuery] string code, 
        [FromQuery] string state)
    {
    try
        {
        var authService = GetAuthServiceFromProvider(provider);
        var storedState = TempData["oauth_state"] as string;
    
        if (state != storedState)
            return BadRequest("Invalid state parameter");

            var redirectUri = Url.Action(nameof(Callback), "Auth", null, Request.Scheme);
            
            var accessToken = await authService.GetAccessTokenAsync(code, redirectUri);
            
            var frontendCallbackUrl = $"http://localhost:3000/dashboard?accessToken={accessToken}&provider={provider.ToLowerInvariant()}";
            return Redirect(frontendCallbackUrl);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    private bool TryParseProvider(string provider, out ProviderType providerType)
    {
        return Enum.TryParse(provider, ignoreCase:true, out providerType);
    }

    private IAuthService? GetAuthServiceFromProvider(string provider)
    {
        try
        {
            if (!TryParseProvider(provider, out var providerType))
                throw new Exception("Invalid provider");

            var authService = _serviceProvider.GetKeyedService<IAuthService>(providerType);

            if (authService is null)
                throw new Exception("Failed to resolve keyedService");

            return authService;
        }
        catch(Exception e)
        {
            throw new Exception(e.Message);
        }
    }    
    
}