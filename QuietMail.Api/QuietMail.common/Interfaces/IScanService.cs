public interface IScanService
{
    ProviderType providerType { get; }
    Task StartScanAsync(string accessToken, string connectionId);
}