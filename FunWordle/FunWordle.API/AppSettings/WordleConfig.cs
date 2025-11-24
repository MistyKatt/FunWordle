namespace FunWordle.API.AppSettings
{
    public sealed class WordleConfig
    {
        public int MaxGuessCount { get; set; } = 6;
        public int InitialTimeSeconds { get; set; } = 1000;
        public int WordLength { get; set; } = 5;
        public string WordListPath { get; set; } = "config/words.txt";
    }
}
