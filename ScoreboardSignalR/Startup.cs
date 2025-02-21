using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace ScoreboardSignalR;

public class Startup
{
    public static void ConfigureServices(IServiceCollection services)
    {
        services.AddSignalR();
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
    }

    public static void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        
        app.UseRouting();
        
        var embeddedFileProvider = new EmbeddedFileProvider(typeof(Program).Assembly, "ScoreboardSignalR.wwwroot");
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = embeddedFileProvider,
            RequestPath = ""
        });
        
        app.UseCors();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapHub<ScoreboardHub>("/scoreboardHub");
        });
    }
}