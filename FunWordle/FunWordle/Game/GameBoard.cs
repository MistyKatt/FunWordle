// FunWordle.CLI/GameBoard.cs
using FunWordle.Cli.Services.AppSettings;
using FunWordle.Core.GameLogic.Calculator;
using FunWordle.Core.Interfaces.DataProvider;
using FunWordle.Core.Interfaces.Evalidator;
using FunWordle.Core.Interfaces.Validators;
using FunWordle.Core.Models;
using System.Diagnostics;

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
    public int Count { get; private set; }
    public HashSet<string> WordList { get; }

    public bool IsFinished => Count <= 0 || (Guesses.Count > 0 && LastGuess.IsWin);

    public GuessResult? LastGuess => _lastGuess ?? null;
    private GuessResult? _lastGuess;

    private IWordValidator _wordValidator;
    private IWordEvaluator _wordEvaluator;
    private IWordListProvider _wordListProvider;
    private ScoreCalculator _scoreCalculator;
    private Stopwatch _stopwatch;
    private WordleConfig _wordleConfig;
    private string _answer;
    private int _max = 0;

    public GameBoard(
        HashSet<string> wordList,
        int initialTimeSeconds,
        int maxGuessCount,
        IWordValidator wordValidator,
        IWordEvaluator wordEvaluator,
        IWordListProvider wordListProvider,
        ScoreCalculator scoreCalculator,
        WordleConfig wordleConfig,
        string answer)
    {
        WordList = wordList ?? throw new ArgumentNullException(nameof(wordList));
        _wordValidator = wordValidator;
        _wordEvaluator = wordEvaluator;
        _wordListProvider = wordListProvider;
        Count = maxGuessCount;
        _scoreCalculator = scoreCalculator;
        _stopwatch = new Stopwatch();
        _wordleConfig = wordleConfig;
        _answer = answer;
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

        var result = _wordEvaluator.EvaluateGuess(validation.NormalizedGuess, _answer);

        _lastGuess = result;
        var entry = new GuessHistoryEntry(result, Guesses.Count + 1);
        Guesses.Add(entry);
        Count--;

        Score = _scoreCalculator.CalculateScore(_max,RemainedTime(), result);
        _max = Math.Max(Score, _max);
        return result;
    }

    public void Initialize()
    {
        Score = 0;
        _lastGuess = null;
        Count = _wordleConfig.MaxGuessCount;
        Guesses.Clear();
        ResetAnswer();
        _stopwatch.Restart();
    }

    public int RemainedTime()
    {
        return Math.Max(0,_wordleConfig.InitialTimeSeconds - (int)_stopwatch.Elapsed.TotalSeconds);
    }

    public string GetAnswer()
    {
        return _answer;
    }
    private void ResetAnswer()
    {
        
        var range = _wordListProvider.WordList.Count;
        var index = new Random().Next(range);
        var answer = _wordListProvider.WordList[index];
        _answer = answer;
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
