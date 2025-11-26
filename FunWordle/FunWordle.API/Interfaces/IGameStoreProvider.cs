using FunWordle.Cli;

namespace FunWordle.API.Interfaces
{
    public interface IGameStoreProvider
    {
        (Guid gameId, GameBoard board) CreateGame();

        bool TryGet(Guid gameId, out GameBoard board);

    }
}
