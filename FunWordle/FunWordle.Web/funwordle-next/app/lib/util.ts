import { GameBoard } from "../domain/game/gameBoard";
import { GameStateDto, GameStatusDto, GuessResultDto } from "./types";


export function ReadIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw == null || raw.trim() === "") return fallback;

  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return n;
}

export function ReadStringEnv(name: string, fallback: string): string {
  const raw = process.env[name];
  if (raw == null) return fallback;

  const value = raw.trim();
  return value.length > 0 ? value : fallback;
}

export function toGameStateDto(
  gameId: string,
  board: GameBoard
): GameStateDto {
  let status: GameStatusDto = GameStatusDto.InProgress;

  if (board.lastGuess?.isWin === true) {
    status = GameStatusDto.Win;
  } else if (board.count <= 0) {
    status = GameStatusDto.Lose;
  }

  const guesses:GuessResultDto[] = board.guesses.map(g => ({
    guess: g.guess.guess,
    letters: g.guess.scores.map((s, idx) => ({
      letter: g.guess.guess[idx],
      match: s,
    })),
  }));

  return {
    gameId,
    guesses,
    remainingGuesses: board.count,
    remainingTimeSeconds: board.remainedTime(),
    score: board.score >= 0 ? board.score : 0,
    status,
  };
}