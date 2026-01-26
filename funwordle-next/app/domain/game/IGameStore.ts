import { GameBoard } from "./gameBoard";
import { GameId } from "./gameStoreProvider";

export interface IGameProvider {
  /**
   * Get a game by id.
   * Returns null if not found or expired.
   */
  tryGet(gameId: GameId): Promise<GameBoard | null>;

  /**
   * Create a new game, persist it, and return id + board.
   * TTL is applied internally by the provider.
   */
  createGame(): Promise<{
    gameId: GameId;
    board: GameBoard;
  }>;

  /**
   * Purge expired games.
   * Best-effort:
   * - In-memory: actively deletes
   * - Redis: usually NOOP (handled by TTL)
   */
  purgeGame(nowMs: number): Promise<void>;
}
