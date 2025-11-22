using FunWordle.Cli.Game;
using FunWordle.Cli.Services.AppSettings;
using FunWordle.Cli.Services.Extensions;
using FunWordle.Core;
using FunWordle.Core.GameLogic.Calculator;
using FunWordle.Core.GameLogic.Calculator.Strategy;
using FunWordle.Core.GameLogic.Evaluator;
using FunWordle.Core.GameLogic.Validators;
using FunWordle.Core.Interfaces.DataProvider;
using FunWordle.Core.Interfaces.Evalidator;
using FunWordle.Core.Interfaces.Validators;
using Microsoft.Extensions.DependencyInjection;

namespace FunWordle.Cli
{
    internal class Program
    {
        static void Main(string[] args)
        {
            var wordleConfig = Configuration.BuildConfiguration();
            var services = new ServiceCollection();
            services.AddCoreServices(wordleConfig);
            services.AddSingleton<WordleConfig>(_=>wordleConfig);
            var provider = services.BuildServiceProvider();
            var runner = provider.GetRequiredService<GameRunner>();
            runner.Run();
        }
    }
}
