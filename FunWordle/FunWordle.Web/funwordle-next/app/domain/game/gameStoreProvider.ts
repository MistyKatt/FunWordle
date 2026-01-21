// src/domain/wordle/game/gameStoreProvider.ts

import crypto from "node:crypto";
import type { WordListProvider } from "@/app/domain/providers/wordlistProvider";
import type { WordleConfig } from "@/app/domain/models/wordleConfig";
import { BasicWordValidator } from "@/app/domain/services/wordValidator";
import { BasicWordEvaluator } from "@/app/domain/services/wordEvaluator";
import { ScoreCalculator } from "@/app/domain/services/scoreCalculator";
import { GameBoard } from "./gameboard";

export type GameId = string; // UUID string

export class GameStoreProvider {
  private readonly games = new Map<GameId, GameBoard>();

  private readonly wordListProvider: WordListProvider;
  private readonly wordValidator: BasicWordValidator;
  private readonly wordEvaluator: BasicWordEvaluator;
  private readonly scoreCalculator: ScoreCalculator;
  private readonly config: WordleConfig;

  constructor(args: {
    wordListProvider: WordListProvider;
    wordValidator: BasicWordValidator;
    wordEvaluator: BasicWordEvaluator;
    scoreCalculator: ScoreCalculator;
    config: WordleConfig;
  }) {
    this.wordListProvider = args.wordListProvider;
    this.wordValidator = args.wordValidator;
    this.wordEvaluator = args.wordEvaluator;
    this.scoreCalculator = args.scoreCalculator;
    this.config = args.config;
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

    return { gameId, board };
  }

  public tryGet(id: GameId): GameBoard | null {
    return this.games.get(id) ?? null;
  }
}

function randomInt(min: number, max: number): number {
  const r = Math.floor(Math.random() * (max - min + 1)) + min;
  return r;
}
