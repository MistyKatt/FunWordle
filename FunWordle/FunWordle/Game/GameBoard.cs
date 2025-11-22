// FunWordle.CLI/GameBoard.cs
using FunWordle.Core;
using FunWordle.Core.GameLogic.Calculator;
using FunWordle.Core.Interfaces.Evalidator;
using FunWordle.Core.Interfaces.Validators;
using FunWordle.Core.Models;
using System;
using System.Collections.Generic;

namespace FunWordle.Cli;

public sealed class GuessHistoryEntry
{
    public GuessResult Guess { get; }
    public int Round { get; }

    public GuessHistoryEntry(GuessResult guess, int round)
    {
        Guess = guess;
        Round = round;
    }
}

public sealed class GameBoard
{
    public int Score { get; private set; } = 0;
    public List<GuessHistoryEntry> Guesses { get; } = new();
    public string Answer { get; private set; }   
    public int Time { get; private set; }        
    public int Count { get; private set; }       
    public HashSet<string> WordList { get; }

    public bool IsFinished => Count <= 0 || (Guesses.Count > 0 && LastGuess.IsWin);

    public GuessResult LastGuess => _lastGuess ?? throw new InvalidOperationException("No guesses yet.");
    private GuessResult? _lastGuess;

    private IWordValidator _wordValidator;
    private IWordEvaluator _wordEvaluator;
    private ScoreCalculator _scoreCalculator;

    public GameBoard(
        HashSet<string> wordList,
        string answer,
        int initialTimeSeconds,
        int maxGuessCount,
        IWordValidator wordValidator,
        IWordEvaluator wordEvaluator,
        ScoreCalculator scoreCalculator)
    {
        WordList = wordList ?? throw new ArgumentNullException(nameof(wordList));
        Answer = (answer ?? throw new ArgumentNullException(nameof(answer))).ToUpperInvariant();
        _wordValidator = wordValidator;
        if (Answer.Length != 5)
            throw new ArgumentException("Answer must be 5 letters.", nameof(answer));

        Time = initialTimeSeconds;
        Count = maxGuessCount;
        _scoreCalculator = scoreCalculator;
    }

    /// <summary>
    /// Decrease timer by one second. You can call this from a timer or loop.
    /// </summary>
    public void Tick()
    {
        if (Time > 0)
            Time--;
    }

    /// <summary>
    /// Process a raw user guess string: validate, evaluate, update state.
    /// Throws on invalid input; CLI should catch and show friendly messages.
    /// </summary>
    public GuessResult MakeGuess(string? rawGuess)
    {
        if (Count <= 0)
            throw new InvalidOperationException("No guesses remaining.");

        var validation = _wordValidator.Validate(rawGuess);
        if (!validation.IsValid)
        {
            // You can change this behavior to return a result type instead of throwing.
            throw new InvalidGuessException(validation.Error);
        }

        var result = _wordEvaluator.EvaluateGuess(rawGuess);

        _lastGuess = result;
        var entry = new GuessHistoryEntry(result, Guesses.Count + 1);
        Guesses.Add(entry);
        Count--;

        Score = _scoreCalculator.CalculateScore(Time, result);

        return result;
    }

    public void Initialize()
    {
        Time = 1000;
        Score = 0;
        _lastGuess = null;
        Count = 6;
        Guesses.Clear();
    }
}

/// <summary>
/// Simple exception type for invalid guesses so CLI can react properly.
/// </summary>
public sealed class InvalidGuessException : Exception
{
    public GuessValidationError Error { get; }

    public InvalidGuessException(GuessValidationError error)
        : base($"Invalid guess: {error}")
    {
        Error = error;
    }
}
