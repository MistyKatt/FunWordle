using FunWordle.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FunWordle.Core.Interfaces.Validators
{
    public interface IWordValidator
    {
        GuessValidationResult Validate(string input);
    }
}
