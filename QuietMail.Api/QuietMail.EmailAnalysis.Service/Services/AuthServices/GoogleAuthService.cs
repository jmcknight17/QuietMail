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
            ClientSecrets = new  ClientSecrets
            {
                ClientId = _configuration["Google:ClientId"],
                ClientSecret = _configuration["Google:ClientSecret"]
            },
            Scopes = new[]
            {
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/gmail.modify",
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

    public async Task<string> GetUrlAsync(string redirectUrl, string state)
    {
        var request = _flow.CreateAuthorizationCodeRequest(redirectUrl);
        request.State = state;
        var authUrl = request.Build().AbsoluteUri;

        return authUrl;
    }
}