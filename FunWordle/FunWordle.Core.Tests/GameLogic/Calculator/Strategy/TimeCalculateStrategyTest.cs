using FunWordle.Core.GameLogic.Calculator.Strategy;
using FunWordle.Core.Models;

namespace FunWordle.Core.Tests.GameLogic.Calculator.Strategy
{
    public sealed class TimeCalculateStrategyTest
    {

        [Fact]
        public void Calculate_AllHit_WhenGuessEqualsAnswers()
        {
            var guessResult = new GuessResult("APPLE", new LetterMatch[] { LetterMatch.Hit, LetterMatch.Hit, LetterMatch.Hit, LetterMatch.Hit, LetterMatch.Hit }, true);
            var strategy = new TimeCalculateStrategy();

            var score = strategy.Calculate(1000,500, guessResult);

            Assert.Equal(1500, score);
        }

        [Theory]
        [InlineData(100, 450)]
        [InlineData(300, 450)]
        public void Calculate_PartialHit_WhenRawScoreBiggerThanMax(int max, int expectedScore)
        {
            var guessResult = new GuessResult("APPLE", new LetterMatch[] { LetterMatch.Hit, LetterMatch.Miss, LetterMatch.Miss, LetterMatch.Present, LetterMatch.Hit }, false);
            var strategy = new TimeCalculateStrategy();

            var score = strategy.Calculate(max,1000, guessResult);

            Assert.Equal(expectedScore, score);
        }

        [Theory]
        [InlineData(500)]
        [InlineData(600)]
        public void Calculate_PartialHit_WhenRawScoreSmallerThanMax(int max)
        {
            var guessResult = new GuessResult("APPLE", new LetterMatch[] { LetterMatch.Hit, LetterMatch.Miss, LetterMatch.Miss, LetterMatch.Present, LetterMatch.Hit }, false);
            var strategy = new TimeCalculateStrategy();

            var score = strategy.Calculate(max,1000, guessResult);

            Assert.Equal(max, score);
        }

        [Fact]
        public void Calculate_InvalidGuess()
        {
            GuessResult? guessResult = null;
            var strategy = new TimeCalculateStrategy();

            Assert.Throws<ArgumentNullException>(() => strategy.Calculate(0,1000, guessResult));
        }
    }
}
