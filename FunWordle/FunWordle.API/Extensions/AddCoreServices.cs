using FunWordle.API.AppSettings;
using FunWordle.API.Data.Providers;
using FunWordle.API.Interfaces;
using FunWordle.Core;
using FunWordle.Core.Interfaces.DataProvider;
using System.Runtime.CompilerServices;
using System.Text.Json;

namespace FunWordle.API.Extensions
{
    public static class AddServices
    {
        public static IServiceCollection AddCoreServices(this IServiceCollection services, WordleConfig config)
        {
            services.AddSingleton(config);
            // Word list provider – adjust ctor if yours takes the path directly
            services.AddSingleton<IWordListProvider>(_ =>
                new FileWordListProvider(config.WordListPath));

            // Game store (in-memory)
            services.AddSingleton<IGameStoreProvider, GameStoreProvider>();

            // Minimal JSON options (optional)
            services.ConfigureHttpJsonOptions(options =>
            {
                options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            });
            return services;
        }
    }
}
