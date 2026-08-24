using Microsoft.VisualBasic;

public interface IAuthService
{
    ProviderType providerType {get; }
    Task<string> GetUrlAsync(string redirectUrl, string state);
    Task<string> GetAccessTokenAsync(string code, string redirectUri);
    
}