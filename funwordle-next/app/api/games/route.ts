// app/api/games/route.ts
import { NextResponse } from "next/server";
import { gameProvider } from "@/app/domain/factory/gameStoreFactory";
import { toGameStateDto } from "@/app/lib/util";

export const runtime = "nodejs";

export async function POST() {
  const { gameId, board } = await gameProvider.createGame();
  const dto = toGameStateDto(gameId, board);
  return NextResponse.json(dto, { status: 200 });
}
