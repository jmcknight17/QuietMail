using System.Net.Http.Headers;
using System.Text.Json;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Microsoft.AspNetCore;

public class GoogleAuthService : IAuthService
{
    public ProviderType providerType => ProviderType.Gmail;
    private readonly IConfiguration _configuration;
    private readonly GoogleAuthorizationCodeFlow _flow;
    public GoogleAuthService(IConfiguration configuration)
    {
        _configuration = configuration;
        _flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = new ClientSecrets
            {
                ClientId = _configuration["Google:ClientId"],
                ClientSecret = _configuration["Google:ClientSecret"]
            },
            Scopes = new[]
            {
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/gmail.modify",
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
            }
        });
    }

    public async Task<string> GetAccessTokenAsync(string code, string redirectUri)
    {
        var token = await _flow.ExchangeCodeForTokenAsync(
            userId: "user",
            code: code,
            redirectUri: redirectUri,
            CancellationToken.None);

        return token.AccessToken;
    }

    public async Task<UserProfileDto> GetUserProfileAsync(string accessToken)
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");

        if (!response.IsSuccessStatusCode)
            throw new Exception($"Failed to fetch Google user profile. {response.StatusCode}: {await response.Content.ReadAsStringAsync()}");

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var email = root.GetProperty("email").GetString() ?? "";
        var picture = root.TryGetProperty("picture", out var picElement) ? picElement.GetString() ?? "" : "";

        var userProfile = new UserProfileDto
        {
            Email = email,
            PictureUrl = picture
        };

        return userProfile;
    }

    public async Task<string> GetUrlAsync(string redirectUrl, string state)
    {
        var request = _flow.CreateAuthorizationCodeRequest(redirectUrl);
        request.State = state;
        var authUrl = request.Build().AbsoluteUri;

        return authUrl;
    }
}