using FunWordle.Cli;
using FunWordle.Cli.Services.AppSettings;
using FunWordle.Core;
using FunWordle.Core.GameLogic.Calculator;
using FunWordle.Core.Interfaces.DataProvider;
using FunWordle.Core.Interfaces.Evalidator;
using FunWordle.Core.Interfaces.Validators;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace FunWordle.API.Data.Providers
{
    public sealed class GameStoreProvider
    {
        private readonly ConcurrentDictionary<Guid, GameBoard> _games = new();

        private readonly IWordListProvider _wordListProvider;
        private readonly IWordValidator _wordValidator;
        private readonly IWordEvaluator _wordEvaluator;
        private readonly ScoreCalculator _scoreCalculator;
        private readonly WordleConfig _config;

        private readonly Random _random = new();

        public GameStoreProvider(
            IWordListProvider wordListProvider,
            IWordValidator wordValidator,
            IWordEvaluator wordEvaluator,
            ScoreCalculator scoreCalculator,
            WordleConfig config)
        {
            _wordListProvider = wordListProvider ?? throw new ArgumentNullException(nameof(wordListProvider));
            _wordValidator = wordValidator ?? throw new ArgumentNullException(nameof(wordValidator));
            _wordEvaluator = wordEvaluator ?? throw new ArgumentNullException(nameof(wordEvaluator));
            _scoreCalculator = scoreCalculator ?? throw new ArgumentNullException(nameof(scoreCalculator));
            _config = config ?? throw new ArgumentNullException(nameof(config));
        }

        public (Guid gameId, GameBoard board) CreateGame()
        {
            var allWords = _wordListProvider.WordList ?? throw new InvalidOperationException("Word list not initialized.");
            if (allWords.Count == 0)
                throw new InvalidOperationException("No valid words available for game creation.");
            var answer = allWords[_random.Next(allWords.Count)];
            var wordSet = new HashSet<string>(allWords);

            var board = new GameBoard(
                wordList: wordSet,
                initialTimeSeconds: _config.InitialTimeSeconds,
                maxGuessCount: _config.MaxGuessCount,
                wordValidator: _wordValidator,
                wordEvaluator: _wordEvaluator,
                wordListProvider: _wordListProvider,
                scoreCalculator: _scoreCalculator,
                wordleConfig: _config,
                answer: answer);

            var id = Guid.NewGuid();
            _games[id] = board;

            return (id, board);
        }

        public bool TryGet(Guid id, out GameBoard board)
            => _games.TryGetValue(id, out board!);
    }
}
