using FunWordle.Core.Interfaces.Calculate;
using FunWordle.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FunWordle.Core.GameLogic.Calculator.Strategy
{
    public class TimeCalculateStrategy : ICalculateStrategy
    {
        private int _timer;

        public TimeCalculateStrategy(int timer)
        {
            _timer = timer;
        }
        public int Calculate(int max, GuessResult guess)
        {
            return 0;
        }
    }
}
