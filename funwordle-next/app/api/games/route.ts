// app/api/games/route.ts
import { NextResponse } from "next/server";
import { gameStoreProvider } from "@/app/domain/game/gameStoreProvider";
import { toGameStateDto } from "@/app/lib/util";

export const runtime = "nodejs";

export async function POST() {
  const { gameId, board } = gameStoreProvider.createGame();
  const dto = toGameStateDto(gameId, board);
  return NextResponse.json(dto, { status: 200 });
}
