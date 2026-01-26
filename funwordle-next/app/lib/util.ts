import { SetCommandOptions } from "@upstash/redis";
import { GameBoard, GuessHistoryEntry } from "../domain/game/gameBoard";
import { GuessResult } from "../domain/models/guess";
import { GameStateDto, GameStateRedis, GameStatusDto, GuessResultDto, KeyInput, LetterResultDto } from "./types";
import { redis } from "./redis";


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

  if (board.isWinning() === true) {
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

export function toGuessResult(guess: GuessResultDto):GuessResult{
    return new GuessResult(
      guess.guess,
      guess.letters.map(l=>{
        return l.match
      }),
      false
    )
  }

export function toGuessResultDto(guess: GuessHistoryEntry): GuessResultDto{
  const guessStr:string = guess.guess.guess;
  const letterMatch: LetterResultDto[] = [];
  for(let i = 0;i< guessStr.length; i++){
    letterMatch.push({
      letter:guessStr[i],
      match:guess.guess.scores[i]
    })
  }
  return {
    guess:guessStr,
    letters:letterMatch
  }

}

export async function saveToRedis<T>(key: string, val: T, opts?: SetCommandOptions){
  await redis.set(key, val, opts);
}

export async function getFromRedis<T>(key: string){
    const result = await redis.get<T>(key);
    if (!result) return null;
    return result;
}


export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}




export function toKeyInputFromKeyboardEvent(e: KeyboardEvent): KeyInput | null {
  if (e.key === "Backspace") return { kind: "backspace" };
  if (e.key === "Enter") return { kind: "enter" };
  if (/^[a-zA-Z]$/.test(e.key)) return { kind: "letter", value: e.key.toUpperCase() };
  return null;
}
