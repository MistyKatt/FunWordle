using FunWordle.API.Data.Providers;
using FunWordle.API.Interfaces;
using FunWordle.API.Models;
using FunWordle.Cli;
using FunWordle.Cli.Services.AppSettings;
using Microsoft.AspNetCore.Mvc;
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
                };
                return Results.Ok(dto);
            });

            app.MapGet("/api/games/{id:guid}", (Guid id, [FromServices] IGameStoreProvider provider) =>
            {
                if (!provider.TryGet(id, out var board))
                    return Results.NotFound();

                var dto = ToGameStateDto(id, board);
                return Results.Ok(dto);
            });

            app.MapGet("/api/games/{id:guid}/answer", (Guid id, [FromServices] IGameStoreProvider provider) =>
            {
                if (!provider.TryGet(id, out var board))
                    return Results.NotFound();
                if (!board.IsFinished)
                    return Results.Unauthorized();
                var dto = new AnswerDTO()
                {
                    Answer = board.GetAnswer()
                };
                return Results.Ok(dto);
            });

            app.MapPost("/api/games/{id:guid}/start", (Guid id, [FromServices] IGameStoreProvider provider) =>
            {
                if (!provider.TryGet(id, out var board))
                    return Results.NotFound();

                board.Initialize();
                var dto = ToGameStateDto(id, board);
                return Results.Ok(dto);
            });

            app.MapPost("/api/games", ([FromServices] IGameStoreProvider provider) =>
            {
                var (id, board) = provider.CreateGame();
                var dto = ToGameStateDto(id, board);
                return Results.Ok(dto);
            });

            app.MapPost("/api/games/{id:guid}",
            (Guid id, [FromBody] GuessRequestDto request, [FromServices] IGameStoreProvider provider) =>
            {
                if (!provider.TryGet(id, out var board))
                    return Results.NotFound();

                if (string.IsNullOrWhiteSpace(request.Guess))
                {
                    var currentState = ToGameStateDto(id, board);
                    return Results.BadRequest(new
                    {
                        error = "EmptyGuess",
                        game = currentState
                    });
                }

                try
                {
                    board.MakeGuess(request.Guess);
                }
                catch (InvalidGuessException ex)
                {
                    var currentState = ToGameStateDto(id, board);
                    return Results.BadRequest(new
                    {
                        error = ex.Error.ToString(), 
                        game = currentState
                    });
                }

                var dto = ToGameStateDto(id, board);
                return Results.Ok(dto);
            });

            static GameStateDto ToGameStateDto(Guid gameId, GameBoard board)
            {
                var status = GameStatusDto.InProgress;
                if (board.LastGuess != null && board.LastGuess.IsWin)
                    status = GameStatusDto.Win;
                else if (board.Count <= 0)
                    status = GameStatusDto.Lose;

                var guesses = board.Guesses.Select((g, i) => new GuessResultDto
                {
                    Guess = g.Guess.Guess,
                    Letters = g.Guess.Scores.Select((s, idx) => new LetterResultDto
                    {
                        Letter = g.Guess.Guess[idx],
                        Match = s
                    }).ToList()
                }).ToList();

                return new GameStateDto
                {
                    GameId = gameId,
                    Guesses = guesses,
                    RemainingGuesses = board.Count,
                    RemainingTimeSeconds = board.RemainedTime(),
                    Score = board.Score>=0? board.Score : 0,
                    Status = status
                };
            }

        }
    }
}
