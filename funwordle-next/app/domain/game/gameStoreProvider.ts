// src/domain/wordle/game/gameStoreProvider.ts

import crypto from "node:crypto";
import { WordListProvider, wordListProvider } from "@/app/domain/providers/wordlistProvider";
import { WordleConfig, wordleConfig } from "@/app/domain/models/wordleConfig";
import { BasicWordValidator, wordValidator } from "@/app/domain/services/wordValidator";
import { BasicWordEvaluator, wordEvaluator } from "@/app/domain/services/wordEvaluator";
import { ScoreCalculator, scoreCalculator } from "@/app/domain/services/scoreCalculator";
import { GameBoard } from "./gameBoard";

export type GameId = string; // UUID string

export class GameStoreProvider {
  private readonly games = new Map<GameId, GameBoard>();

  private readonly wordListProvider: WordListProvider;
  private readonly wordValidator: BasicWordValidator;
  private readonly wordEvaluator: BasicWordEvaluator;
  private readonly scoreCalculator: ScoreCalculator;
  private readonly config: WordleConfig;

  constructor(
    wordListProvider: WordListProvider,
    wordValidator: BasicWordValidator,
    wordEvaluator: BasicWordEvaluator,
    scoreCalculator: ScoreCalculator,
    config: WordleConfig
  ) {
    this.wordListProvider = wordListProvider;
    this.wordValidator = wordValidator;
    this.wordEvaluator = wordEvaluator;
    this.scoreCalculator = scoreCalculator;
    this.config =config;
  }

  public createGame(): { gameId: GameId; board: GameBoard } {
    const allWords = Array.from(this.wordListProvider.wordList);
    if (allWords.length === 0) {
      throw new Error("No valid words available for game creation.");
    }

    const answer = allWords[randomInt(0, allWords.length - 1)];

    // Keep a Set copy, as you did with HashSet<string>
    const wordSet = new Set(allWords);

    const board = new GameBoard({
      wordSet,
      wordValidator: this.wordValidator,
      wordEvaluator: this.wordEvaluator,
      wordListProvider: this.wordListProvider,
      scoreCalculator: this.scoreCalculator,
      config: this.config,
      answer,
    });

    // In C# you created the board then stored it; you didn't call Initialize().
    // If you want stopwatch to start immediately, call board.initialize() here.
    board.initialize();

    const gameId = crypto.randomUUID();
    this.games.set(gameId, board);
    this.purgeGame();
    return { gameId, board };
  }

  public tryGet(id: GameId): GameBoard | null {
    return this.games.get(id) ?? null;
  }

  private purgeGame(): void {
  const MAX_SIZE = 1000;
  const PURGE_COUNT = 200;

  if (this.games.size < MAX_SIZE) return;

  const keys = Array.from(this.games.keys());
  const toDelete = Math.min(PURGE_COUNT, keys.length);

  for (let i = 0; i < toDelete; i++) {
    const index = randomInt(0, keys.length - 1);
    const key = keys[index];

    this.games.delete(key);

    // Remove the key from the array to avoid deleting twice
    keys.splice(index, 1);
  }
}
}

function randomInt(min: number, max: number): number {
  const r = Math.floor(Math.random() * (max - min + 1)) + min;
  return r;
}

export const gameStoreProvider = new GameStoreProvider(
    wordListProvider,
    wordValidator,
    wordEvaluator,
    scoreCalculator,
    wordleConfig
)
