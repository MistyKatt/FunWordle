export interface ConfigDto {
  maxGuessCount: number;
  initialTimeSeconds: number;
}

// Matches C# GameStatusDto
export type GameStatusDto = 'InProgress' | 'Win' | 'Lose';

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

// Matches C# GuessRequestDto
export interface GuessRequestDto {
  guess: string;
}