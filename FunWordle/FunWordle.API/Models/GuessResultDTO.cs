namespace FunWordle.API.Models
{
    public sealed class GuessResultDto
    {
        public string Guess { get; set; } = string.Empty;
        public List<LetterResultDto> Letters { get; set; } = new();
    }
}
