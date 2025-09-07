using Microsoft.OpenApi.Models;
using QuietMail.common.Hubs;
using QuietMail.EmailAnalysis.Service.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My Email API", Version = "v1" });
});

builder.Services.AddControllers();

builder.Services.AddCors();

builder.Services.AddControllersWithViews();

builder.Services.AddSession();

builder.Services.AddSignalR();

builder.Services.AddScoped<GmailAnalysisService>();
builder.Services.AddScoped<ManageInboxService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My Email API V1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();

app.UseCors(builder =>
    builder.WithOrigins("https://localhost:3000", "http://localhost:3000")
           .AllowAnyHeader()
           .AllowAnyMethod()
           .AllowCredentials());

app.MapControllers();

app.MapHub<ProgressHub>("/progressHub");

app.UseSession();


app.Run();
