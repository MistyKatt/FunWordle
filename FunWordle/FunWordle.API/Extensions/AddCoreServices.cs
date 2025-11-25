using FunWordle.API.Data.Providers;
using FunWordle.API.Interfaces;
using FunWordle.Cli.Services.AppSettings;
using FunWordle.Core;
using FunWordle.Core.GameLogic.Calculator;
using FunWordle.Core.GameLogic.Calculator.Strategy;
using FunWordle.Core.GameLogic.Evaluator;
using FunWordle.Core.GameLogic.Validators;
using FunWordle.Core.Interfaces.DataProvider;
using FunWordle.Core.Interfaces.Evalidator;
using FunWordle.Core.Interfaces.Validators;
using System.Runtime.CompilerServices;
using System.Text.Json;

namespace FunWordle.API.Extensions
{
    public static class AddServices
    {
        public static IServiceCollection AddCoreServices(this IServiceCollection services, WordleConfig config)
        {
            services.AddSingleton<WordleConfig>(_=>config);
            
            services.AddSingleton<IWordListProvider>(_ =>
                new FileWordListProvider(config.WordListPath));
            services.AddSingleton<IWordValidator>(sp =>
            {
                var provider = sp.GetRequiredService<IWordListProvider>();
                return new BasicWordValidator(provider);
            });
            services.AddSingleton<IWordEvaluator, BasicWordEvaluator>();
            services.AddSingleton<TimeCalculateStrategy>(_ =>
                new TimeCalculateStrategy());

            services.AddSingleton(sp =>
            {
                var strategy = sp.GetRequiredService<TimeCalculateStrategy>();
                return new ScoreCalculator(strategy);
            });

            services.AddSingleton<IGameStoreProvider, GameStoreProvider>();

            services.ConfigureHttpJsonOptions(options =>
            {
                options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            });
            return services;
        }
    }
}
