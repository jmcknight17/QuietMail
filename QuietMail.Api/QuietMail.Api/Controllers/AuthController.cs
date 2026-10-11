using Microsoft.AspNetCore.Mvc;

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

            var url = await authService.GetUrlAsync(redirectUri, state);

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
    public async Task<IActionResult> Callback(
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

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.None, 
                Expires = DateTimeOffset.UtcNow.AddHours(1),
                Path = "/"
            };

            Response.Cookies.Append("accessToken", accessToken, cookieOptions);
            Response.Cookies.Append("provider", provider.ToLowerInvariant(), cookieOptions);

            var frontendCallbackUrl = $"http://localhost:3000/dashboard";
            return Redirect(frontendCallbackUrl);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("~/auth/logout")]
    public IActionResult Logout()
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.None,
            Path = "/"
        };

        Response.Cookies.Delete("accessToken", cookieOptions);
        Response.Cookies.Delete("provider", cookieOptions);

        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("~/auth/me")]
    public async Task<IActionResult> CheckStatus()
    {
        if (!Request.Cookies.TryGetValue("accessToken", out var accessToken) ||
            !Request.Cookies.TryGetValue("provider", out var provider))
            return Unauthorized(new { isAuthenticated = false, message = "No active session" });
        

        try
        {
            var authService = _providerHelper.GetAuthServiceFromRouteString(provider);
            if (authService is null) return BadRequest($"No auth service for: {provider}");

            var userProfile = await authService.GetUserProfileAsync(accessToken);

            return Ok(new
            {
                isAuthenticated = true,
                user = new
                {
                    email = userProfile.Email,
                    pictureUrl = userProfile.PictureUrl,
                    provider = provider.ToLowerInvariant()
                }
            });
        }
        catch
        {
            return Unauthorized(new { isAuthenticated = false, message = "Session expired or invalid" });
        }
    }

}