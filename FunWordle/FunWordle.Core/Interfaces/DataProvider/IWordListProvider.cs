using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FunWordle.Core.Interfaces.DataProvider
{
    public interface IWordListProvider
    {
        IReadOnlyList<string> WordList { get; }
    }
}
