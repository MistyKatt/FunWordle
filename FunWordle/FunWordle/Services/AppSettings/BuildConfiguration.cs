using Microsoft.Extensions.Configuration;

namespace FunWordle.Cli.Services.AppSettings
{
    public static class Configuration
    {
        public static WordleConfig BuildConfiguration()
        {
            var configuration = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

            var wordleConfig = configuration
                .GetSection("Wordle")
                .Get<WordleConfig>();

            if (wordleConfig == null)
            {
                throw new InvalidOperationException("The configuration is not built!");
            }
            return wordleConfig;
        }
    }
}
