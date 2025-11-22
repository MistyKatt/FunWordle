// tests/FunWordle.Core.Tests/BasicWordValidatorTests.cs
using FunWordle.Core;
using FunWordle.Core.GameLogic.Validators;
using FunWordle.Core.Interfaces.DataProvider;
using FunWordle.Core.Models;
using System;
using System.Collections.Generic;
using Xunit;

namespace FunWordle.Core.Tests.Validation
{
    public sealed class BasicWordValidatorTests
    {
        private sealed class FakeWordListProvider : IWordListProvider
        {

            public IReadOnlyList<string> WordList { get; }
            public FakeWordListProvider(IEnumerable<string> words)
            {
                WordList = new List<string>(words);
            }

            
        }

        private static BasicWordValidator CreateValidator(params string[] words)
        {
            var provider = new FakeWordListProvider(words);
            return new BasicWordValidator(provider);
        }

        [Fact]
        public void Validate_ReturnsEmpty_WhenInputIsNull()
        {
            var validator = CreateValidator("APPLE", "HOUSE");

            var result = validator.Validate(null);

            Assert.Equal(GuessValidationError.Empty, result.Error);
        }

        [Fact]
        public void Validate_ReturnsEmpty_WhenInputIsWhitespace()
        {
            var validator = CreateValidator("APPLE", "HOUSE");

            var result = validator.Validate("   ");

            Assert.Equal(GuessValidationError.Empty, result.Error);
        }

        [Theory]
        [InlineData("APP")]      
        [InlineData("APPLES")]   
        public void Validate_ReturnsWrongLength_WhenLengthIsNotFive(string input)
        {
            var validator = CreateValidator("APPLE", "HOUSE");

            var result = validator.Validate(input);

            Assert.Equal(GuessValidationError.WrongLength, result.Error);
        }

        [Theory]
        [InlineData("APP1E")]
        [InlineData("APPL-")]
        [InlineData("AP LE")]
        public void Validate_ReturnsNonAlphabetic_WhenContainsNonLetters(string input)
        {
            var validator = CreateValidator("APPLE", "HOUSE");

            var result = validator.Validate(input);

            Assert.Equal(GuessValidationError.NonAlphabetic, result.Error);
        }

        [Fact]
        public void Validate_ReturnsNotInDictionary_WhenWordNotInList()
        {
            var validator = CreateValidator("APPLE", "HOUSE");

            var result = validator.Validate("OTHER");

            Assert.Equal(GuessValidationError.NotInDictionary, result.Error);
            Assert.Equal("OTHER", result.NormalizedGuess); 
        }

        [Fact]
        public void Validate_ReturnsCorrect_WhenWordIsInDictionary_ExactCase()
        {
            var validator = CreateValidator("APPLE", "HOUSE");

            var result = validator.Validate("APPLE");

            Assert.Equal(GuessValidationError.Correct, result.Error);
            Assert.Equal("APPLE", result.NormalizedGuess);
        }

        [Fact]
        public void Validate_NormalizesInput_ToUpperAndTrim_BeforeCheckingDictionary()
        {
            var validator = CreateValidator("APPLE", "HOUSE");

            var result = validator.Validate("  apple  ");

            Assert.Equal(GuessValidationError.Correct, result.Error);
            Assert.Equal("APPLE", result.NormalizedGuess);
        }
    }
}
