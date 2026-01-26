// src/domain/wordle/game/gameBoard.ts

import { GuessResult, GuessValidationError } from "@/app/domain/models/guess";
import { wordleConfig, type WordleConfig } from "@/app/domain/models/wordleConfig";
import { wordListProvider, WordListProvider } from "@/app/domain/providers/wordlistProvider";
import { BasicWordEvaluator, wordEvaluator} from "@/app/domain/services/wordEvaluator";
import { BasicWordValidator, wordValidator, } from "@/app/domain/services//wordValidator";
import { scoreCalculator, ScoreCalculator } from "@/app/domain/services/scoreCalculator";
import { GameStateRedis, GuessResultDto } from "@/app/lib/types";
import { toGuessResult, toGuessResultDto } from "@/app/lib/util";

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

  private readonly wordValidator: BasicWordValidator;
  private readonly wordEvaluator: BasicWordEvaluator;
  private readonly wordListProvider: WordListProvider;
  private readonly scoreCalculator: ScoreCalculator;
  private readonly config: WordleConfig;

  private answer: string;
  private isWin: boolean = false;

  // Node-friendly stopwatch: store start timestamp in ms.
  private startedAtMs: number | null = null;
  private endAtMs: number | null = null;

  constructor(args: {
    wordValidator: BasicWordValidator;
    wordEvaluator: BasicWordEvaluator;
    wordListProvider: WordListProvider;
    scoreCalculator: ScoreCalculator;
    config: WordleConfig;
    answer: string;
  }) {
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

  /** Start/restart the game (equivalent to Initialize). */
  public initialize(): void {
    this.scoreValue = 0;
    this.remainingCount = this.config.maxGuessCount;
    this.guessesValue.length = 0;
    this.isWin = false;
    this.resetAnswer();
    this.startedAtMs = Date.now();
  }

  /**
   * Remaining time in seconds. Clamped at 0.
   * Equivalent to RemainedTime().
   */
  public remainedTime(): number {
    if (this.startedAtMs == null) return this.config.initialTimeSeconds;
    if (this.endAtMs !== null) return this.endAtMs;
    const elapsedSec = Math.floor((Date.now() - this.startedAtMs) / 1000);
    return Math.max(0, this.config.initialTimeSeconds - elapsedSec);
  }

  /**
   * Equivalent to GetAnswer(): stops the stopwatch and returns answer.
   * In Node, "stop" just freezes by clearing startedAtMs.
   */
  public getAnswer(): string {
    return this.answer;
  }

  public isFinished():boolean {
    if(this.isWin||this.remainingCount<=0)
      return true;
    return false;
  }

  public isWinning(): boolean{
    return this.isWin;
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

    if(result.isWin === true)
    {
      this.isWin = true;  
    }   
    const entry = new GuessHistoryEntry(result, this.guessesValue.length + 1);
    this.guessesValue.push(entry);
    this.remainingCount--;
    const remained = this.remainedTime();
    // NOTE: This preserves your original semantics (even though the variable name was "time").
    // If you intended "time used", you'd compute used = initial - remained.
    this.scoreValue = this.scoreCalculator.calculate(this.scoreValue, remained, result);
    if(this.isFinished())
      this.endAtMs = this.remainedTime();
    return result;
  }

  public static toGameBoard(gameState: GameStateRedis) : GameBoard {
  
      const board = new GameBoard({
        wordValidator: wordValidator,
        wordEvaluator: wordEvaluator,
        wordListProvider: wordListProvider,
        scoreCalculator: scoreCalculator,
        config: wordleConfig,
        answer: gameState.answer
      });
      board.startedAtMs = gameState.startedAtMs;
      board.remainingCount = gameState.remainingGuesses;
      let guessHistory:GuessHistoryEntry[] = gameState.guesses.map((g, index)=>{
        return new GuessHistoryEntry(
          toGuessResult(g),
          index+1
        )
      });
      board.guessesValue.push(...guessHistory);
      board.isWin = gameState.isWin;
      board.endAtMs = gameState.endAtMs;    
      board.scoreValue = gameState.scoreValue;
      return board;
  }

  public toGameStateRedis(): GameStateRedis{
    const guesses: GuessResultDto[] = this.guesses.map(g=>{
      return toGuessResultDto(g);
    })
    return {
      scoreValue:this.score,
      remainingGuesses:this.count,
      guesses:guesses,
      startedAtMs:this.startedAtMs,
      endAtMs:this.endAtMs,
      answer:this.answer,
      isWin:this.isWin
    }
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
