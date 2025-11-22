

using FunWordle.Core.Interfaces.Validators;
using FunWordle.Core.Models;

namespace FunWordle.Core.GameLogic.Validators
{
    public class BasicWordValidator:IWordValidator
    {
        private ISet<string> _wordList;

        public BasicWordValidator(ISet<string> wordList)
        {
            _wordList = wordList;
        }

        public GuessValidationResult Validate(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return new GuessValidationResult(GuessValidationError.Empty);

            var guess = input.Trim().ToUpperInvariant();

            if (guess.Length != 5)
                return new GuessValidationResult(GuessValidationError.WrongLength);

            if (!guess.All(char.IsLetter))
                return new GuessValidationResult(GuessValidationError.NonAlphabetic);

            if (!_wordList.Contains(guess))
                return new GuessValidationResult(GuessValidationError.NotInDictionary, guess);

            return new GuessValidationResult(GuessValidationError.Correct, guess);
        }
    }
}
