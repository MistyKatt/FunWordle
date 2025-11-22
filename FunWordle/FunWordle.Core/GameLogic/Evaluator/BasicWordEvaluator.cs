using FunWordle.Core.Interfaces.Evalidator;
using FunWordle.Core.Models;

namespace FunWordle.Core.GameLogic.Evaluator
{
    public class BasicWordEvaluator : IWordEvaluator
    {
        private string _answer;

        public BasicWordEvaluator(string answer)
        {
            _answer = answer;
        }
        public GuessResult EvaluateGuess(string input)
        {
            if (_answer is null) throw new ArgumentNullException(nameof(_answer));
            if (input is null) throw new ArgumentNullException(nameof(input));
            if (_answer.Length != input.Length)
                throw new ArgumentException("Answer and guess must have same length.");

            int n = _answer.Length;
            var scores = new LetterMatch[n];
            var remainingCounts = new int[26];

            for (int i = 0; i < n; i++)
            {
                if (input[i] == _answer[i])
                {
                    scores[i] = LetterMatch.Hit;
                }
                else
                {
                    scores[i] = LetterMatch.Miss;
                    int idx = _answer[i] - 'A';
                    if (idx is >= 0 and < 26)
                        remainingCounts[idx]++;
                }
            }

            for (int i = 0; i < n; i++)
            {
                if (scores[i] == LetterMatch.Hit) continue;

                int idx = input[i] - 'A';
                if (idx is >= 0 and < 26 && remainingCounts[idx] > 0)
                {
                    scores[i] = LetterMatch.Present;
                    remainingCounts[idx]--;
                }
            }

            bool isWin = true;
            for (int i = 0; i < n; i++)
            {
                if (scores[i] != LetterMatch.Hit)
                {
                    isWin = false;
                    break;
                }
            }

            return new GuessResult(input, scores, isWin);
        }
    }
}
