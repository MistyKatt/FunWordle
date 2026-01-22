import { ReadIntEnv } from "@/app/lib/util";

export type WordleConfig = Readonly<{
  initialTimeSeconds: number;
  maxGuessCount: number;
  wordLength: number;
}>;


export const wordleConfig:WordleConfig = {
  initialTimeSeconds:ReadIntEnv("WORDLE_INITIAL_TIME_SECONDS",1000),
  maxGuessCount:ReadIntEnv("WORDLE_MAX_GUESS_COUNT",6),
  wordLength:ReadIntEnv("WORDLE_WORD_LENGTH",5)
}