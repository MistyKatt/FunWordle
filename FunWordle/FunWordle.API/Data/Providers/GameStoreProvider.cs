using FunWordle.API.Interfaces;
using FunWordle.Cli;

namespace FunWordle.API.Data.Providers
{
    public class GameStoreProvider : IGameStoreProvider
    {
        public (Guid gameId, GameBoard board) CreateGame()
        {
            throw new NotImplementedException();
        }

        public bool TryGet(Guid gameId, out GameBoard board)
        {
            throw new NotImplementedException();
        }
    }
}
