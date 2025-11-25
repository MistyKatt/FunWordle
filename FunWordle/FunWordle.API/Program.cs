using FunWordle.API.Data.Providers;
using FunWordle.API.Extensions;
using FunWordle.API.Interfaces;
using FunWordle.Cli.Services.AppSettings;
using FunWordle.Core.Interfaces.DataProvider;
using System.Text.Json;

namespace FunWordle.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var wordleConfig = Configuration.BuildConfiguration();
            builder.Configuration.GetSection("Wordle").Bind(wordleConfig);
            builder.Services.AddCoreServices(wordleConfig);

            var app = builder.Build();
            app.UseHttpsRedirection();
            app.MapAPIRoutes();
            app.Run();
        }
    }
}
