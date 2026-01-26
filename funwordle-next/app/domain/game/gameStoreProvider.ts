// src/domain/wordle/game/gameStoreProvider.ts

import crypto from "node:crypto";
import { WordListProvider, wordListProvider } from "@/app/domain/providers/wordlistProvider";
import { WordleConfig, wordleConfig } from "@/app/domain/models/wordleConfig";
import { BasicWordValidator, wordValidator } from "@/app/domain/services/wordValidator";
import { BasicWordEvaluator, wordEvaluator } from "@/app/domain/services/wordEvaluator";
import { ScoreCalculator, scoreCalculator } from "@/app/domain/services/scoreCalculator";
import { GameBoard } from "./gameBoard";
import { IGameProvider } from "./IGameStore";

export type GameId = string; // UUID string

type GameEntry = {
  board: GameBoard;
  expiresAtMs: number; // epoch ms
};

export class GameStoreProvider implements IGameProvider{
  private readonly games = new Map<GameId, GameEntry>();
  private readonly ttlMs = 60 * 60 * 1000;
  private readonly MAX_SIZE = 1000;
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

  public async createGame(): Promise<{ gameId: GameId; board: GameBoard }> {
    const allWords = Array.from(this.wordListProvider.wordList);
    if (allWords.length === 0) {
      throw new Error("No valid words available for game creation.");
    }

    const answer = allWords[randomInt(0, allWords.length - 1)];

    const board = new GameBoard({
      wordValidator: this.wordValidator,
      wordEvaluator: this.wordEvaluator,
      wordListProvider: this.wordListProvider,
      scoreCalculator: this.scoreCalculator,
      config: this.config,
      answer,
    });

    const gameId = crypto.randomUUID();
    const now = Date.now();
    this.games.set(gameId, {
      board,
      expiresAtMs: now + this.ttlMs,
    });
    this.purgeGame(now);
    return { gameId, board };
  }

  public async tryGet(id: GameId): Promise<GameBoard | null> {
    const entry = this.games.get(id);
    if (!entry) return null;

    if (entry.expiresAtMs <= Date.now()) {
      this.games.delete(id);
      return null;
    }

    return entry.board;
  }

  public async purgeGame(nowMs: number = Date.now()): Promise<void> {

    for (const [id, entry] of this.games) {
      if (entry.expiresAtMs <= nowMs) {
        this.games.delete(id);
      }
    }

    if (this.games.size <= this.MAX_SIZE) return;

    const entries = Array.from(this.games.entries());
    entries.sort((a, b) => a[1].expiresAtMs - b[1].expiresAtMs);

    const excess = this.games.size - this.MAX_SIZE;
    for (let i = 0; i < excess; i++) {
      this.games.delete(entries[i][0]);
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
