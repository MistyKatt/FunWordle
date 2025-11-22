using FunWordle.Core.Interfaces.Calculate;
using FunWordle.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace FunWordle.Core.GameLogic.Calculator.Strategy
{
    public class TimeCalculateStrategy : ICalculateStrategy
    {
        private int _timer;
        private readonly int _match = 200;
        private readonly int _exist = 50;

        public TimeCalculateStrategy(int timer)
        {
            _timer = timer;
        }
        public int Calculate(int max, GuessResult guess)
        {
            if (guess is null) throw new ArgumentException(nameof(guess));
            if (guess.IsWin)
            {
                return _match * 5 + _timer;
            }
            var scores = guess.Scores;
            var currentScore = 0;
            foreach ( var score in scores )
            {
                switch (score)
                {
                    case (LetterMatch.Hit):
                        currentScore += 200;
                        break;
                    case (LetterMatch.Present):
                        currentScore += 50;
                        break;
                    case (LetterMatch.Miss):
                    default:
                        break;
                }
            }
            return Math.Max(max, currentScore);
        }
    }
}
