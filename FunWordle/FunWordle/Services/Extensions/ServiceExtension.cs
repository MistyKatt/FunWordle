using FunWordle.Cli.Game;
using FunWordle.Cli.Services.AppSettings;
using FunWordle.Core;
using FunWordle.Core.GameLogic.Calculator;
using FunWordle.Core.GameLogic.Calculator.Strategy;
using FunWordle.Core.GameLogic.Evaluator;
using FunWordle.Core.GameLogic.Validators;
using FunWordle.Core.Interfaces.DataProvider;
using FunWordle.Core.Interfaces.Evalidator;
using FunWordle.Core.Interfaces.Validators;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FunWordle.Cli.Services.Extensions
{
    public static class ServiceExtension
    {
        public static IServiceCollection AddCoreServices(this IServiceCollection services, WordleConfig config)
        {
            services.AddSingleton<IWordListProvider>(_ =>
                            new FileWordListProvider(config.WordListPath));

            services.AddSingleton<IWordValidator>(sp =>
            {
                var provider = sp.GetRequiredService<IWordListProvider>();
                return new BasicWordValidator(provider);
            });

            services.AddSingleton<IWordEvaluator>(sp =>
            {               
                return new BasicWordEvaluator();
            });

            services.AddSingleton<TimeCalculateStrategy>(_ =>
                new TimeCalculateStrategy());

            services.AddSingleton(sp =>
            {
                var strategy = sp.GetRequiredService<TimeCalculateStrategy>();
                return new ScoreCalculator(strategy);
            });


            // GameBoard
            services.AddSingleton<GameBoard>(sp =>
            {
                var provider = sp.GetRequiredService<IWordListProvider>();
                var validator = sp.GetRequiredService<IWordValidator>();
                var evaluator = sp.GetRequiredService<IWordEvaluator>();
                var calculator = sp.GetRequiredService<ScoreCalculator>();
                var config = sp.GetRequiredService<WordleConfig>();

                var range = provider.WordList.Count;
                var index = new Random().Next(range);
                var answer = provider.WordList[index];
                // If your GameBoard ctor is different, adjust this part.
                // Example ctor: GameBoard(HashSet<string> wordList, int initialTime, int maxGuesses)
                return new GameBoard(
                    wordList: new HashSet<string>(provider.WordList),
                    initialTimeSeconds: config.InitialTimeSeconds,
                    maxGuessCount: config.MaxGuessCount,
                    wordValidator: validator,
                    wordEvaluator: evaluator,
                    wordListProvider:provider,
                    scoreCalculator: calculator,
                    wordleConfig: config,
                    answer: answer);
            });

            // GameRunner
            services.AddSingleton<GameRunner>();
            return services;
        }
    }
}
