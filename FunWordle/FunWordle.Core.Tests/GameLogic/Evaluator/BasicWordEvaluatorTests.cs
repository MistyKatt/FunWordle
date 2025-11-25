using FunWordle.Core.GameLogic.Evaluator;
using FunWordle.Core.Models;

namespace FunWordle.Core.Tests.Evaluation
{
    public sealed class BasicWordEvaluatorTests
    {
        private static BasicWordEvaluator CreateEvaluator()
            => new BasicWordEvaluator();

        [Fact]
        public void EvaluateGuess_AllHits_WhenGuessEqualsAnswer()
        {
            var evaluator = CreateEvaluator();

            var result = evaluator.EvaluateGuess("APPLE", "APPLE");

            Assert.True(result.IsWin);
            Assert.Equal(
                new[] {
                    LetterMatch.Hit,
                    LetterMatch.Hit,
                    LetterMatch.Hit,
                    LetterMatch.Hit,
                    LetterMatch.Hit
                },
                result.Scores);
        }

        [Fact]
        public void EvaluateGuess_AllMiss_WhenNoLettersOverlap()
        {
            var evaluator = CreateEvaluator();

            var result = evaluator.EvaluateGuess("BBBBB", "APPLE");

            Assert.False(result.IsWin);
            Assert.Equal(
                new[] {
                    LetterMatch.Miss,
                    LetterMatch.Miss,
                    LetterMatch.Miss,
                    LetterMatch.Miss,
                    LetterMatch.Miss
                },
                result.Scores);
        }

        [Fact]
        public void EvaluateGuess_MarksPresent_WhenLetterExistsInDifferentPosition()
        {
            var evaluator = CreateEvaluator();

            var result = evaluator.EvaluateGuess("EEEEE","APPLE");

            Assert.False(result.IsWin);
            Assert.Equal(
                new[] {
                    LetterMatch.Miss,  
                    LetterMatch.Miss,
                    LetterMatch.Miss,
                    LetterMatch.Miss,
                    LetterMatch.Hit    
                },
                result.Scores);
        }

        [Fact]
        public void EvaluateGuess_DoesNotOvercountDuplicates_WhenGuessHasMoreOfLetterThanAnswer()
        {
            var evaluator = CreateEvaluator();

            var result = evaluator.EvaluateGuess("PPPAP", "APPLE");

            Assert.False(result.IsWin);
            Assert.Equal(
                new[] {
                    LetterMatch.Miss,
                    LetterMatch.Hit,
                    LetterMatch.Hit,
                    LetterMatch.Present,
                    LetterMatch.Miss
                },
                result.Scores);
        }

        [Fact]
        public void EvaluateGuess_HandlesDuplicates_HitsTakePriorityOverPresents()
        {
            var evaluator = CreateEvaluator();

            var result = evaluator.EvaluateGuess("PAPAL", "APPLE");

            Assert.False(result.IsWin);
            Assert.Equal(5, result.Scores.Length);
        }

        [Fact]
        public void EvaluateGuess_IsWinFalse_WhenNotAllHits()
        {
            var evaluator = CreateEvaluator();

            var result = evaluator.EvaluateGuess("APPLY", "APPLE"); 

            Assert.False(result.IsWin);
            Assert.Equal(
                new[] {
                    LetterMatch.Hit,
                    LetterMatch.Hit,
                    LetterMatch.Hit,
                    LetterMatch.Hit,
                    LetterMatch.Miss
                },
                result.Scores);
        }

        [Fact]
        public void EvaluateGuess_ThrowsArgumentNull_WhenInputIsNull()
        {
            var evaluator = CreateEvaluator();

            Assert.Throws<ArgumentNullException>(() => evaluator.EvaluateGuess(null,"APPLE"));
        }

        [Fact]
        public void EvaluateGuess_ThrowsArgumentException_WhenLengthDoesNotMatchAnswer()
        {
            var evaluator = CreateEvaluator();

            Assert.Throws<ArgumentException>(() => evaluator.EvaluateGuess("APP", "APPLE"));
            Assert.Throws<ArgumentException>(() => evaluator.EvaluateGuess("APPLEE", "APPLE"));
        }

        [Fact]
        public void EvaluateGuess_ThrowsArgumentNull_WhenAnswerIsNullInternally()
        {
            var evaluator = new BasicWordEvaluator();
            Assert.Throws<ArgumentNullException>(() => evaluator.EvaluateGuess("APPLE", null));
        }
    }
}

