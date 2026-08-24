using QuietMail.Api.Interfaces;
using QuietMail.EmailAnalysis.Service.Services;

var builder = Host.CreateApplicationBuilder(args);
var host = builder.Build();
host.Run();