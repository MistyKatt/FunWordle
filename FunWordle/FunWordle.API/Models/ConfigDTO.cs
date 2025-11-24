namespace FunWordle.API.Models
{
    public sealed class ConfigDto
    {
        public int MaxGuessCount { get; set; }
        public int InitialTimeSeconds { get; set; }
        public int WordLength { get; set; }
    }
}
