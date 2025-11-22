using FunWordle.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FunWordle.Core.Interfaces.Calculate
{
    public interface ICalculateStrategy
    {
        int Calculate(int max, int time, GuessResult guess);
    }
}
