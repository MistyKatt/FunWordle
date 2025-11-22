using FunWordle.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FunWordle.Core.Interfaces.Evalidator
{
    public interface IWordEvaluator
    {
        GuessResult EvaluateGuess(string input, string answer);
    }
}
