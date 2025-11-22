using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FunWordle.Core.Models
{
    public enum LetterMatch
    {
        Miss,    
        Present, 
        Hit      
    }
    public class GuessResult
    {
        public string Guess { get; }
        public LetterMatch[] Scores { get; }
        public bool IsWin { get; }

        public GuessResult(string guess, LetterMatch[] scores, bool isWin)
        {
            if (guess is null) throw new ArgumentNullException(nameof(guess));
            if (scores is null) throw new ArgumentNullException(nameof(scores));
            if (scores.Length != guess.Length)
                throw new ArgumentException("Scores length must match guess length.", nameof(scores));

            Guess = guess;
            Scores = scores;
            IsWin = isWin;
        }
    }
}
