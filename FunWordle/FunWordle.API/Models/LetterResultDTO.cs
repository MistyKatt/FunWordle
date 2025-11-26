using FunWordle.Core.Models;

namespace FunWordle.API.Models
{
    public sealed class LetterResultDto
    {
        public char Letter { get; set; }
        public LetterMatch Match { get; set; }
    }

}
