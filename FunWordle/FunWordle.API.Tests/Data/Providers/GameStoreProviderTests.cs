using FunWordle.API.Data.Providers;
using FunWordle.Cli.Services.AppSettings;
using FunWordle.Core.GameLogic.Calculator;
using FunWordle.Core.GameLogic.Calculator.Strategy;
using FunWordle.Core.GameLogic.Evaluator;
using FunWordle.Core.GameLogic.Validators;
using FunWordle.Core.Interfaces.DataProvider;
using System.Collections.ObjectModel;

public class GameStoreProviderTests
{
    private GameStoreProvider CreateProvider()
    {
        var wordListProvider = new FakeWordListProvider(new List<string>
        {
            "APPLE", "HOUSE", "PLANT"
        });
        var validator = new BasicWordValidator(wordListProvider);
        var evaluator = new BasicWordEvaluator();

        var config = new WordleConfig
        {
            MaxGuessCount = 6,
            InitialTimeSeconds = 1000,
        };

        var scoreCalculator = new ScoreCalculator(new TimeCalculateStrategy());

        return new GameStoreProvider(
            wordListProvider,
            validator,
            evaluator,
            scoreCalculator,
            config);
    }

    [Fact]
    public void CreateGame_ShouldReturnValidGame()
    {

        var provider = CreateProvider();

        var (gameId, board) = provider.CreateGame();

        Assert.NotEqual(Guid.Empty, gameId);
        Assert.NotNull(board);
        Assert.Equal(6, board.Count); 
        Assert.Equal(1000, board.RemainedTime());
    }

    [Fact]
    public void TryGet_ShouldReturnGame_WhenExists()
    {
        var provider = CreateProvider();
        var (gameId, board) = provider.CreateGame();

        var exists = provider.TryGet(gameId, out var retrieved);

        Assert.True(exists);
        Assert.NotNull(retrieved);
        Assert.Same(board, retrieved); 
    }

    [Fact]
    public void TryGet_ShouldReturnFalse_WhenNotExist()
    {
        var provider = CreateProvider();
        var randomId = Guid.NewGuid();

        var exists = provider.TryGet(randomId, out var board);

        Assert.False(exists);
        Assert.Null(board);
    }

    private sealed class FakeWordListProvider : IWordListProvider
    {
        public FakeWordListProvider(List<string> words)
        {
            WordList = new ReadOnlyCollection<string>(words);
        }

        public IReadOnlyList<string> WordList { get; }

    }
}
