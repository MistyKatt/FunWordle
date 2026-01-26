// app/api/games/[id]/start/route.ts
import { NextResponse } from "next/server";
import { gameProvider } from "@/app/domain/factory/gameStoreFactory";
import { saveToRedis, toGameStateDto } from "@/app/lib/util";
import { GameStateRedis } from "@/app/lib/types";

export const runtime = "nodejs";

// RFC 4122 UUID (same as other routes)
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  _req: Request,
   context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // 1️⃣ Invalid GUID → 400
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "Invalid game id format" },
      { status: 400 }
    );
  }

  // 2️⃣ GUID but game not found → 404
  const board = await gameProvider.tryGet(id);
  if (!board) {
    return NextResponse.json(
      { error: "Game not found" },
      { status: 404 }
    );
  }

  // 3️⃣ Found → initialize + return state
  board.initialize();
  if(!(process.env.WORDLE_RUNNING_ENV === 'local')){
  const redisState = board.toGameStateRedis();
  await saveToRedis<GameStateRedis>(`game:${id}`, redisState, { ex: 3600 })
  }
  const dto = toGameStateDto(id, board);

  return NextResponse.json(dto, { status: 200 });
}
