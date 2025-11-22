using FunWordle.Core.GameLogic.Evaluator;
using FunWordle.Core.Models;

namespace FunWordle.Core.Tests.Evaluation
{
    public sealed class BasicWordEvaluatorTests
    {
        private static BasicWordEvaluator CreateEvaluator(string answer)
            => new BasicWordEvaluator(answer);

        [Fact]
        public void EvaluateGuess_AllHits_WhenGuessEqualsAnswer()
        {
            var evaluator = CreateEvaluator("APPLE");

            var result = evaluator.EvaluateGuess("APPLE");

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
            var evaluator = CreateEvaluator("APPLE");

            var result = evaluator.EvaluateGuess("BBBBB");

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
            var evaluator = CreateEvaluator("APPLE");

            var result = evaluator.EvaluateGuess("EEEEE");

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
            var evaluator = CreateEvaluator("APPLE");

            var result = evaluator.EvaluateGuess("PPPAP");

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
            var evaluator = CreateEvaluator("APPLE");

            var result = evaluator.EvaluateGuess("PAPAL");

            Assert.False(result.IsWin);
            Assert.Equal(5, result.Scores.Length);
        }

        [Fact]
        public void EvaluateGuess_IsWinFalse_WhenNotAllHits()
        {
            var evaluator = CreateEvaluator("APPLE");

            var result = evaluator.EvaluateGuess("APPLY"); 

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
            var evaluator = CreateEvaluator("APPLE");

            Assert.Throws<ArgumentNullException>(() => evaluator.EvaluateGuess(null!));
        }

        [Fact]
        public void EvaluateGuess_ThrowsArgumentException_WhenLengthDoesNotMatchAnswer()
        {
            var evaluator = CreateEvaluator("APPLE");

            Assert.Throws<ArgumentException>(() => evaluator.EvaluateGuess("APP"));
            Assert.Throws<ArgumentException>(() => evaluator.EvaluateGuess("APPLEE"));
        }

        [Fact]
        public void EvaluateGuess_ThrowsArgumentNull_WhenAnswerIsNullInternally()
        {
            var evaluator = new BasicWordEvaluator(null!);
            Assert.Throws<ArgumentNullException>(() => evaluator.EvaluateGuess("APPLE"));
        }
    }
}

