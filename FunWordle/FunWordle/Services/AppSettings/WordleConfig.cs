using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FunWordle.Cli.Services.AppSettings
{
    public class WordleConfig
    {
        public string WordListPath { get; set; } = "";
        public int MaxGuessCount { get; set; }
        public int InitialTimeSeconds { get; set; }
    }
}
