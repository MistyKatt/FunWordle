import crypto from "node:crypto";
import { redis } from "@/app/lib/redis";
import { wordListProvider, WordListProvider } from "@/app/domain/providers/wordlistProvider";
import { wordleConfig, WordleConfig } from "@/app/domain/models/wordleConfig";
import { BasicWordValidator, wordValidator } from "@/app/domain/services/wordValidator";
import { BasicWordEvaluator, wordEvaluator } from "@/app/domain/services/wordEvaluator";
import { scoreCalculator, ScoreCalculator } from "@/app/domain/services/scoreCalculator";
import { GameBoard } from "./gameBoard";
import type { GameStateRedis } from "@/app/lib/types";
import { IGameProvider } from "./IGameStore";

export type GameId = string;

export class RedisGameStoreProvider implements IGameProvider{
  private readonly wordListProvider: WordListProvider;
  private readonly wordValidator: BasicWordValidator;
  private readonly wordEvaluator: BasicWordEvaluator;
  private readonly scoreCalculator: ScoreCalculator;
  private readonly config: WordleConfig;

  private readonly ttlSeconds = 60 * 60; // 1 hour

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
    this.config = config;
  }

  private key(id: GameId) {
    return `game:${id}`;
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

    const state: GameStateRedis = board.toGameStateRedis();

    await redis.set(this.key(gameId), state, { ex: this.ttlSeconds });

    return { gameId, board };
  }

  public async tryGet(id: GameId): Promise<GameBoard | null> {
    const state = await redis.get<GameStateRedis>(this.key(id));
    if (!state) return null;

    const board = GameBoard.toGameBoard(state);

    return board;
  }

  //no need to manage in redis
  public async purgeGame(nowMs: number = Date.now()):Promise<void>{
    
  }


}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const redisGameStoreProvider = new RedisGameStoreProvider(
  wordListProvider,
  wordValidator,
  wordEvaluator,
  scoreCalculator,
  wordleConfig
)
