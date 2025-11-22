namespace FunWordle.Core.Models
{

    public enum GuessValidationError
    {
        Correct,
        Empty,
        WrongLength,
        NonAlphabetic,
        NotInDictionary
    }
    public class GuessValidationResult
    {
        public bool IsValid => Error == GuessValidationError.Correct;
        public GuessValidationError Error { get; }
        public string NormalizedGuess { get; }

        public GuessValidationResult(GuessValidationError error, string normalizedGuess = "")
        {
            Error = error;
            NormalizedGuess = normalizedGuess;
        }
    }
}
