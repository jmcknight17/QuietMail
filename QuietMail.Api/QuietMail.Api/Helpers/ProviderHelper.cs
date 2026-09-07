using QuietMail.Api.Interfaces;

public class ProviderHelper : IProviderHelper
{
    private readonly IServiceProvider _serviceProvider;

    public ProviderHelper(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IAuthService? GetAuthServiceFromRouteString(string provider)
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
        catch (Exception e)
        {
            throw new Exception(e.Message);
        }
    }

    public IEmailActionService? GetEmailActionServiceFromRouteString(string provider)
    {
        try
        {
            if (!TryParseProvider(provider, out var providerType))
                throw new Exception("Invalid provider");

            var emailActionService = _serviceProvider.GetKeyedService<IEmailActionService>(providerType);

            if (emailActionService is null)
                throw new Exception("Failed to resolve keyedService");

            return emailActionService;
        }
        catch (Exception e)
        {
            throw new Exception(e.Message);
        }
    }

    public IScanService? GetScanServiceFromRouteString(string provider)
    {
        try
        {
            if (!TryParseProvider(provider, out var providerType))
                throw new Exception("Invalid provider");

            var scanService = _serviceProvider.GetKeyedService<IScanService>(providerType);

            if (scanService is null)
                throw new Exception("Failed to resolve keyedService");

            return scanService;
        }
        catch (Exception e)
        {
            throw new Exception(e.Message);
        }
    }

    private bool TryParseProvider(string provider, out ProviderType providerType)
    {
        return Enum.TryParse(provider, ignoreCase: true, out providerType);
    }
}