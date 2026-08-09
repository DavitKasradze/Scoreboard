using System.IO;
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
        var wwwrootPath = Path.Combine(System.AppContext.BaseDirectory, "wwwroot");
        
        IFileProvider fileProvider;
        if (Directory.Exists(wwwrootPath))
        {
            var physicalProvider = new PhysicalFileProvider(wwwrootPath);
            fileProvider = new CompositeFileProvider(physicalProvider, embeddedFileProvider);
        }
        else
        {
            fileProvider = embeddedFileProvider;
        }

        app.UseDefaultFiles(new DefaultFilesOptions
        {
            FileProvider = fileProvider
        });

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = fileProvider,
            RequestPath = ""
        });
        
        app.UseCors();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapHub<ScoreboardHub>("/scoreboardHub");
        });
    }
}