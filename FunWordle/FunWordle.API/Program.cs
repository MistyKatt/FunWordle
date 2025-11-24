
using FunWordle.API.AppSettings;
using FunWordle.API.Data.Providers;
using FunWordle.API.Extensions;
using FunWordle.API.Interfaces;
using FunWordle.Core;
using FunWordle.Core.Interfaces.DataProvider;
using System.Text.Json;

namespace FunWordle.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var wordleConfig = new WordleConfig();
            builder.Configuration.GetSection("Wordle").Bind(wordleConfig);
            builder.Services.AddCoreServices(wordleConfig);

            var app = builder.Build();
            app.UseHttpsRedirection();
            app.MapAPIRoutes();
            app.Run();
        }
    }
}
