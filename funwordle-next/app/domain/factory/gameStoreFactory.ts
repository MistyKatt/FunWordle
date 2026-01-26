import type { IGameProvider } from "@/app/domain/game/IGameStore";
import { gameStoreProvider } from "@/app/domain/game/gameStoreProvider"; // in-memory singleton you already export
import { redisGameStoreProvider } from "@/app/domain/game/redisGameStoreProvider"; // redis singleton you already export
import { ReadStringEnv } from "@/app/lib/util";

function resolveProvider(): IGameProvider {
  const env = ReadStringEnv("WORDLE_RUNNING_ENV", "");
  if (env === "local") return gameStoreProvider;

  return redisGameStoreProvider;
}

// --- Singleton caching ---
// In Next dev, modules can be re-evaluated due to HMR.
// globalThis keeps the singleton stable across reloads in development.
declare global {
  // eslint-disable-next-line no-var
  var __wordleGameProvider: IGameProvider | undefined;
}

export function getGameProvider(): IGameProvider {
  // dev: cache on globalThis
  if (process.env.WORDLE_RUNNING_ENV === "local") {
    globalThis.__wordleGameProvider ??= resolveProvider();
    return globalThis.__wordleGameProvider;
  }

  // prod: module-level singleton is enough
  return resolveProvider();
}

// Optional: export a “singleton instance” constant for convenience.
// This is safe because getGameProvider() already caches in dev.
export const gameProvider: IGameProvider = getGameProvider();
