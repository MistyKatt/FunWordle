import { NextResponse } from "next/server";
import { gameStoreProvider } from "@/app/domain/game/gameStoreProvider";
import { toGameStateDto } from "@/app/lib/util";
import { GuessRequestDto } from "@/app/lib/types";
import { InvalidGuessError } from "@/app/domain/game/gameBoard";

export const runtime = "nodejs";

// RFC 4122 UUID v4 (crypto.randomUUID-compatible)
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // 1. Not a valid GUID → 400
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "Invalid game id format" },
      { status: 400 }
    );
  }

  // 2. GUID but game not found → 404
  const board = gameStoreProvider.tryGet(id);
  if (!board) {
    return NextResponse.json(
      { error: "Game not found" },
      { status: 404 }
    );
  }

  // 3. Found → 200
  const dto = toGameStateDto(id, board);
  return NextResponse.json(dto, { status: 200 });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // 1) invalid id -> 400
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "InvalidGameId" },
      { status: 400 }
    );
  }

  // 2) valid guid but game not found -> 404
  const board = gameStoreProvider.tryGet(id);
  if (!board) {
    return NextResponse.json(
      { error: "GameNotFound" },
      { status: 404 }
    );
  }

  // 3) parse request body
  let body: GuessRequestDto;
  try {
    body = (await req.json()) as GuessRequestDto;
  } catch {
    // If body isn't valid JSON, treat as empty guess (or return 400 "BadJson")
    const currentState = toGameStateDto(id, board);
    return NextResponse.json(
      { error: "EmptyGuess", game: currentState },
      { status: 400 }
    );
  }

  const guess = body?.guess;

  // 4) empty guess -> 400 with current state
  if (guess == null || guess.trim().length === 0) {
    const currentState = toGameStateDto(id, board);
    return NextResponse.json(
      { error: "EmptyGuess", game: currentState },
      { status: 400 }
    );
  }

  // 5) try make guess, map domain error -> 400 with current state
  try {
    board.makeGuess(guess);
  } catch (err) {
    if (err instanceof InvalidGuessError) {
      const currentState = toGameStateDto(id, board);
      return NextResponse.json(
        { error: err.error, game: currentState },
        { status: 400 }
      );
    }

    // Unexpected error -> 500
    throw err;
  }

  // 6) success -> 200 updated state
  const dto = toGameStateDto(id, board);
  return NextResponse.json(dto, { status: 200 });
}

