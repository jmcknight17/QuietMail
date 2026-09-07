using QuietMail.Api.Interfaces;

public interface IProviderHelper
{
    IAuthService? GetAuthServiceFromRouteString(string provider);
    IScanService? GetScanServiceFromRouteString(string provider);
    IEmailActionService? GetEmailActionServiceFromRouteString(string provider);

}