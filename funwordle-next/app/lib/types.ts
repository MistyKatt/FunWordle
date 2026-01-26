export interface ConfigDto {
  maxGuessCount: number;
  initialTimeSeconds: number;
}

// Matches C# GameStatusDto
export enum GameStatusDto {
  InProgress = 0,
  Win = 1,
  Lose = 2,
}

// Matches C# LetterMatch enum (likely serialized as numeric: 0 = Miss, 1 = Present, 2 = Hit)
export enum LetterMatch {
  Miss = 0,
  Present = 1,
  Hit = 2,
}

// Matches C# LetterResultDto
// C# char -> JSON string of length 1
export interface LetterResultDto {
  letter: string;        // single character, e.g. "A"
  match: LetterMatch;    // enum value
}

export interface AnswerDTO {
  answer:string;
  explanation?:ExplanationsDto|null;
}

export type ExplanationDefinitionDto = {
  definition: string;
};

export type ExplanationMeaningDto = {
  partOfSpeech: string;
  definitions: ExplanationDefinitionDto[]; // max 3
};

export type ExplanationsDto = {
  word: string;
  phonetic?: string;
  meanings: ExplanationMeaningDto[];
};
// Matches C# GuessResultDto
export interface GuessResultDto {
  guess: string;
  letters: LetterResultDto[];
}

// Matches C# GameStateDto
// C# Guid -> JSON string
export interface GameStateDto {
  gameId: string;
  guesses: GuessResultDto[];
  remainingGuesses: number;
  remainingTimeSeconds: number;
  score: number;
  status: GameStatusDto;
}

export type GameStateRedis = {
  scoreValue: number;
  remainingGuesses: number;
  guesses: GuessResultDto[];
  startedAtMs: number|null;
  endAtMs: number|null;
  answer:string;
  isWin:boolean;
}

// Matches C# GuessRequestDto
export interface GuessRequestDto {
  guess: string;
}

export type KeyInput =
  | { kind: "backspace" }
  | { kind: "enter" }
  | { kind: "letter"; value: string }
  | null;