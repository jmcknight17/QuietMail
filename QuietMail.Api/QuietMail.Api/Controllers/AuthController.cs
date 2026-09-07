using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;


namespace QuietMail.Api.Controllers;


[ApiController]
[Route("auth/{provider}")]
public class AuthController : Controller
{
    private readonly IProviderHelper _providerHelper;
    public AuthController(IProviderHelper providerHelper)
    {
        _providerHelper = providerHelper;
    }
    
    [HttpGet("login")]
    public async Task<IActionResult> Login([FromRoute] string provider)
    {
        try
        {
            var authService = _providerHelper.GetAuthServiceFromRouteString(provider);

            if (authService is null)
                return BadRequest($"No auth service found for provider: {provider}");

            var redirectUri = Url.Action(nameof(Callback), "Auth", new { provider }, protocol: Request.Scheme);
            
            if (string.IsNullOrEmpty(redirectUri))
                return BadRequest("Failed to build the redirect URI");

            var state = Guid.NewGuid().ToString("N");
            TempData[$"oauth_state_{provider.ToLowerInvariant()}"] = state;

            var url  = await authService.GetUrlAsync(redirectUri, state);
            
            if (string.IsNullOrEmpty(url))
                throw new Exception("Failed to generate the authorization URL");

            return Redirect(url);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpGet("callback")]
    public async Task<IActionResult>Callback(
        [FromRoute] string provider, 
        [FromQuery] string code, 
        [FromQuery] string state)
    {
    try
        {
        var authService = _providerHelper.GetAuthServiceFromRouteString(provider);

        if (authService is null)
                return BadRequest($"No auth service found for provider: {provider}");

        var storedState = TempData[$"oauth_state_{provider.ToLowerInvariant()}"] as string;
    
        if (state != storedState)
            return BadRequest("Invalid state parameter");

            var redirectUri = Url.Action(nameof(Callback), "Auth", new { provider }, Request.Scheme);
            
            var accessToken = await authService.GetAccessTokenAsync(code, redirectUri);
            
            var frontendCallbackUrl = $"http://localhost:3000/dashboard?accessToken={accessToken}&provider={provider.ToLowerInvariant()}";
            return Redirect(frontendCallbackUrl);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

}