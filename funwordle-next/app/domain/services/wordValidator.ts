// src/domain/wordle/services/wordValidator.ts

import { GuessValidationError, GuessValidationResult } from "@/app/domain/models/guess";
import { WordListProvider, wordListProvider } from "@/app/domain/providers/wordlistProvider";
import { ReadIntEnv } from "@/app/lib/util";

export class BasicWordValidator {
  private readonly provider: WordListProvider;
  private readonly wordLength: number;

  constructor(provider: WordListProvider, wordLength: number = 5) {
    this.provider = provider;
    this.wordLength = wordLength;
  }

  public validate(input: string | null | undefined): GuessValidationResult {
    if (input == null || input.trim().length === 0) {
      return new GuessValidationResult(GuessValidationError.Empty);
    }

    const guess = input.trim().toUpperCase(); // upper invariant is fine for A-Z

    if (guess.length !== this.wordLength) {
      return new GuessValidationResult(GuessValidationError.WrongLength);
    }

    // Equivalent to guess.All(char.IsLetter) in your constraints (A-Z only).
    // If you truly want Unicode letters, use \p{L} with /u, but Wordle is A-Z.
    if (!/^[A-Z]+$/.test(guess)) {
      return new GuessValidationResult(GuessValidationError.NonAlphabetic);
    }

    if (!this.provider.wordList.has(guess)) {
      // keep normalized guess just like your C# (you pass guess in NotInDictionary)
      return new GuessValidationResult(GuessValidationError.NotInDictionary, guess);
    }

    return GuessValidationResult.ok(guess);
  }
}

export const wordValidator = new BasicWordValidator(wordListProvider, ReadIntEnv("WORDLE_WORD_LENGTH",5));
