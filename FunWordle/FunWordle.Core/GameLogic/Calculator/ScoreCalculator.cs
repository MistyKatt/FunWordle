using FunWordle.Core.Interfaces.Calculate;
using FunWordle.Core.Models;

namespace FunWordle.Core.GameLogic.Calculator
{
    public class ScoreCalculator
    {
        private ICalculateStrategy _strategy;

        public ScoreCalculator(ICalculateStrategy strategy)
        {
            {
                _strategy = strategy;
            }
        }

        public int CalculateScore(int max, int time, GuessResult guessResult)
        {
            return _strategy.Calculate(max, time, guessResult);
        }
    }
}
