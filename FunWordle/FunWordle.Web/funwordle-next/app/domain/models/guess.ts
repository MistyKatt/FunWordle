// src/domain/wordle/guess.ts

/** Per-letter match score (equivalent to your C# enum LetterMatch). */
export const LetterMatch = {
  Miss: "Miss",
  Present: "Present",
  Hit: "Hit",
} as const;

export type LetterMatch = (typeof LetterMatch)[keyof typeof LetterMatch];

/** Stores the result of a single guess. */
export class GuessResult {
  public readonly guess: string;
  public readonly scores: ReadonlyArray<LetterMatch>;
  public readonly isWin: boolean;

  constructor(guess: string, scores: ReadonlyArray<LetterMatch>, isWin: boolean) {
    if (guess == null) throw new Error("guess is required");
    if (scores == null) throw new Error("scores is required");
    if (scores.length !== guess.length) {
      throw new Error("Scores length must match guess length.");
    }

    this.guess = guess;
    // Freeze defensively so external callers can't mutate the array reference.
    this.scores = Object.freeze([...scores]);
    this.isWin = isWin;
    Object.freeze(this); // extra immutability (optional but nice for domain models)
  }
}

/** Guess input validation error (equivalent to your C# enum GuessValidationError). */
export const GuessValidationError = {
  Correct: "Correct",
  Empty: "Empty",
  WrongLength: "WrongLength",
  NonAlphabetic: "NonAlphabetic",
  NotInDictionary: "NotInDictionary",
} as const;

export type GuessValidationError =
  (typeof GuessValidationError)[keyof typeof GuessValidationError];

/** Stores the guess input validation result. */
export class GuessValidationResult {
  public readonly error: GuessValidationError;
  public readonly normalizedGuess: string;

  public get isValid(): boolean {
    return this.error === GuessValidationError.Correct;
  }

  constructor(error: GuessValidationError, normalizedGuess: string = "") {
    this.error = error;
    this.normalizedGuess = normalizedGuess ?? "";
    Object.freeze(this);
  }

  public static ok(normalizedGuess: string): GuessValidationResult {
    return new GuessValidationResult(GuessValidationError.Correct, normalizedGuess);
  }

  public static fail(error: Exclude<GuessValidationError, "Correct">): GuessValidationResult {
    return new GuessValidationResult(error, "");
  }
}
