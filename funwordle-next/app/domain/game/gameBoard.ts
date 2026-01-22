// src/domain/wordle/game/gameBoard.ts

import { GuessResult, GuessValidationError } from "@/app/domain/models/guess";
import type { WordleConfig } from "@/app/domain/models/wordleConfig";
import type { WordListProvider } from "@/app/domain/providers/wordlistProvider";
import { BasicWordEvaluator } from "@/app/domain/services/wordEvaluator";
import { BasicWordValidator } from "@/app/domain/services//wordValidator";
import { ScoreCalculator } from "@/app/domain/services/scoreCalculator";

/** Equivalent to your GuessHistoryEntry. */
export class GuessHistoryEntry {
  public readonly guess: GuessResult;
  public readonly round: number;

  constructor(guess: GuessResult, round: number) {
    this.guess = guess;
    this.round = round;
    Object.freeze(this);
  }
}

/** Equivalent to InvalidGuessException. */
export class InvalidGuessError extends Error {
  public readonly error: GuessValidationError;

  constructor(error: GuessValidationError) {
    super(`Invalid guess: ${error}`);
    this.name = "InvalidGuessError";
    this.error = error;
  }
}

/**
 * Stores the status of a single game:
 * - guesses history
 * - answer
 * - remaining attempts
 * - time tracking
 * - score
 */
export class GameBoard {
  private scoreValue = 0;
  private remainingCount: number;
  private readonly guessesValue: GuessHistoryEntry[] = [];
  private lastGuessValue: GuessResult | null = null;

  private readonly wordValidator: BasicWordValidator;
  private readonly wordEvaluator: BasicWordEvaluator;
  private readonly wordListProvider: WordListProvider;
  private readonly scoreCalculator: ScoreCalculator;
  private readonly config: WordleConfig;

  private answer: string;
  private maxScore = 0;

  // Node-friendly stopwatch: store start timestamp in ms.
  private startedAtMs: number | null = null;

  // Store as Set for membership checks / potential UI hints.
  public readonly wordSet: ReadonlySet<string>;

  constructor(args: {
    wordSet: ReadonlySet<string>;
    wordValidator: BasicWordValidator;
    wordEvaluator: BasicWordEvaluator;
    wordListProvider: WordListProvider;
    scoreCalculator: ScoreCalculator;
    config: WordleConfig;
    answer: string;
  }) {
    this.wordSet = args.wordSet;
    this.wordValidator = args.wordValidator;
    this.wordEvaluator = args.wordEvaluator;
    this.wordListProvider = args.wordListProvider;
    this.scoreCalculator = args.scoreCalculator;
    this.config = args.config;

    this.answer = args.answer;
    this.remainingCount = args.config.maxGuessCount;
  }

  // --- public getters (read-only views) ---
  public get score(): number {
    return this.scoreValue;
  }

  public get guesses(): ReadonlyArray<GuessHistoryEntry> {
    return this.guessesValue;
  }

  public get count(): number {
    return this.remainingCount;
  }

  public get lastGuess(): GuessResult | null {
    return this.lastGuessValue;
  }

  public get isFinished(): boolean {
    return (
      this.remainingCount <= 0 ||
      (this.guessesValue.length > 0 && this.lastGuessValue?.isWin === true)
    );
  }

  /** Start/restart the game (equivalent to Initialize). */
  public initialize(): void {
    this.scoreValue = 0;
    this.maxScore = 0;
    this.lastGuessValue = null;
    this.remainingCount = this.config.maxGuessCount;
    this.guessesValue.length = 0;

    this.resetAnswer();
    this.startedAtMs = Date.now();
  }

  /**
   * Remaining time in seconds. Clamped at 0.
   * Equivalent to RemainedTime().
   */
  public remainedTime(): number {
    if (this.startedAtMs == null) return this.config.initialTimeSeconds;

    const elapsedSec = Math.floor((Date.now() - this.startedAtMs) / 1000);
    return Math.max(0, this.config.initialTimeSeconds - elapsedSec);
  }

  /**
   * Equivalent to GetAnswer(): stops the stopwatch and returns answer.
   * In Node, "stop" just freezes by clearing startedAtMs.
   */
  public getAnswer(): string {
    this.startedAtMs = null;
    return this.answer;
  }

  /**
   * Process a raw user guess string: validate, evaluate, update state.
   * Matches your behavior: throw InvalidGuessError on invalid input.
   */
  public makeGuess(rawGuess: string | null | undefined): GuessResult {
    if (this.remainingCount <= 0) {
      throw new Error("No guesses remaining.");
    }

    const validation = this.wordValidator.validate(rawGuess);
    if (!validation.isValid) {
      throw new InvalidGuessError(validation.error);
    }

    const result = this.wordEvaluator.evaluateGuess(
      validation.normalizedGuess,
      this.answer
    );

    this.lastGuessValue = result;

    const entry = new GuessHistoryEntry(result, this.guessesValue.length + 1);
    this.guessesValue.push(entry);
    this.remainingCount--;

    const remained = this.remainedTime();
    // NOTE: This preserves your original semantics (even though the variable name was "time").
    // If you intended "time used", you'd compute used = initial - remained.
    this.scoreValue = this.scoreCalculator.calculate(this.maxScore, remained, result);
    this.maxScore = Math.max(this.scoreValue, this.maxScore);

    return result;
  }

  // --- private helpers ---
  private resetAnswer(): void {
    // WordListProvider uses Set, but we need an index pick. Convert once per reset.
    const allWords = Array.from(this.wordListProvider.wordList);
    if (allWords.length === 0) {
      throw new Error("Word list not initialized or empty.");
    }

    const index = randomInt(0, allWords.length - 1);
    this.answer = allWords[index];
  }
}

/** Inclusive random int. */
function randomInt(min: number, max: number): number {
  // For demo/in-memory, Math.random is fine.
  // If you want stronger randomness later, use node:crypto randomInt.
  const r = Math.floor(Math.random() * (max - min + 1)) + min;
  return r;
}
