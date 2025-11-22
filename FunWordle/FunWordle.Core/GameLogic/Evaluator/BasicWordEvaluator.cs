using FunWordle.Core.Interfaces.Evalidator;
using FunWordle.Core.Models;
using System.Globalization;

namespace FunWordle.Core.GameLogic.Evaluator
{
    public class BasicWordEvaluator : IWordEvaluator
    {
        public GuessResult EvaluateGuess(string input, string answer)
        {
            if (answer is null) throw new ArgumentNullException(nameof(answer));
            if (input is null) throw new ArgumentNullException(nameof(input));
            if (answer.Length != input.Length)
                throw new ArgumentException("Answer and guess must have same length.");

            int n = answer.Length;
            var scores = new LetterMatch[n];
            var remainingCounts = new int[26];

            for (int i = 0; i < n; i++)
            {
                if (input[i] == answer[i])
                {
                    scores[i] = LetterMatch.Hit;
                }
                else
                {
                    scores[i] = LetterMatch.Miss;
                    int idx = answer[i] - 'A';
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
