// lib/api.ts
import type { AnswerDTO, ConfigDto, ExplanationDefinitionDto, GameStateDto } from './types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? '';

// ---------- helpers ----------

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    // @ts-expect-error - caller must handle undefined if needed
    return undefined;
  }
  return JSON.parse(text) as T;
}

function buildUrl(path: string): string {
  return `${API_BASE}${path}`;
}

// ---------- types for error shape of POST /api/games/{id} ----------

export interface GuessErrorResponse {
  error: string;
  game: GameStateDto;
}

export type GuessResult =
  | { ok: true; game: GameStateDto }
  | { ok: false; error: string; game: GameStateDto };

// ---------- API calls ----------

/**
 * GET /api/config
 * Returns global configuration for the game (max guesses, initial time).
 */
export async function getConfig(): Promise<ConfigDto> {
  const res = await fetch(buildUrl('/api/config'), {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error(`Failed to load config: ${res.status}`);
  }

  return parseJson<ConfigDto>(res);
}

/**
 * POST /api/games
 * Creates a new game and returns its initial state.
 */
export async function createGame(): Promise<GameStateDto> {
  const res = await fetch(buildUrl('/api/games'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to create game: ${res.status}`);
  }

  return parseJson<GameStateDto>(res);
}

/**
 * GET /api/games/{id}
 * Returns current state of an existing game, or null if not found (404).
 */
export async function getGame(gameId: string): Promise<GameStateDto | null> {
  const res = await fetch(buildUrl(`/api/games/${gameId}`), {
    method: 'GET',
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to load game: ${res.status}`);
  }

  return parseJson<GameStateDto>(res);
}

export async function getAnswer(gameId: string): Promise<AnswerDTO | null> {
  const res = await fetch(buildUrl(`/api/games/${gameId}/answer`), {
    method: 'GET',
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to get game answer: ${res.status}`);
  }

  return parseJson<AnswerDTO>(res);
}

export async function getHint(gameId: string): Promise<ExplanationDefinitionDto | null> {
  const res = await fetch(buildUrl(`/api/games/${gameId}/hint`), {
    method: 'GET',
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to get game answer: ${res.status}`);
  }

  return parseJson<ExplanationDefinitionDto>(res);
}

/**
 * POST /api/games/{id}/start
 * Calls board.Initialize() and returns refreshed game state.
 * Useful if you want a "start game" button separate from creation.
 */
export async function startGame(gameId: string): Promise<GameStateDto> {
  const res = await fetch(buildUrl(`/api/games/${gameId}/start`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Game not found');
    }
    throw new Error(`Failed to start game: ${res.status}`);
  }

  return parseJson<GameStateDto>(res);
}

/**
 * POST /api/games/{id}
 * Submits a guess.
 *
 * On success (valid guess):
 *   - HTTP 200, body = GameStateDto
 *   -> returns { ok: true, game }
 *
 * On invalid guess (validation error):
 *   - HTTP 400, body = { error: string, game: GameStateDto }
 *   -> returns { ok: false, error, game }
 *
 * On 404:
 *   - throws
 */
export async function submitGuess(
  gameId: string,
  guess: string,
): Promise<GuessResult> {
  const res = await fetch(buildUrl(`/api/games/${gameId}`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ guess }),
  });

  if (res.status === 404) {
    throw new Error('Game not found');
  }

  if (res.status === 400) {
    const body = await parseJson<GuessErrorResponse>(res);
    return {
      ok: false,
      error: body.error,
      game: body.game,
    };
  }

  if (!res.ok) {
    throw new Error(`Failed to submit guess: ${res.status}`);
  }

  const game = await parseJson<GameStateDto>(res);
  return { ok: true, game };
}
