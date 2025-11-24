using System.Runtime.CompilerServices;

namespace FunWordle.API.Extensions
{
    public static class MapRoutes
    {
        public static void MapAPIRoutes(this WebApplication app)
        {
            app.MapGet("/api/config", ([FromServices] WordleConfig config) =>
            {
                var dto = new ConfigDto
                {
                    MaxGuessCount = config.MaxGuessCount,
                    InitialTimeSeconds = config.InitialTimeSeconds,
                    WordLength = config.WordLength
                };
                return Results.Ok(dto);
            });

            app.MapGet("/api/games/{id:guid}", (Guid id, GameStore store) =>
            {
                if (!store.TryGet(id, out var board))
                    return Results.NotFound();

                var dto = ToGameStateDto(id, board);
                return Results.Ok(dto);
            });

            // 3) Create new game (for brand new user)
            app.MapPost("/api/games", (GameStore store) =>
            {
                var (id, board) = store.CreateGame();
                var dto = ToGameStateDto(id, board);
                return Results.Ok(dto);
            });

            app.MapGet("/api/games/{id:guid}/score", (Guid id, GameStore store) =>
            {
                if (!store.TryGet(id, out var board))
                    return Results.NotFound();

                var dto = new ScoreDto
                {
                    GameId = id,
                    Score = int.TryParse(board.Score, out var score) ? score : 0
                };

                return Results.Ok(dto);
            });

        }
    }
}
