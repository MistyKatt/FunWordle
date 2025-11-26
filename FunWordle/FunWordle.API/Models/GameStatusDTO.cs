namespace FunWordle.API.Models
{
    public enum GameStatusDto
    {
        InProgress,
        Win,
        Lose
    }
    public sealed class GameStateDto
    {
        public Guid GameId { get; set; }
        public List<GuessResultDto> Guesses { get; set; } = new();
        public int RemainingGuesses { get; set; }
        public int RemainingTimeSeconds { get; set; }
        public int Score { get; set; }
        public GameStatusDto Status { get; set; }
    }
}
