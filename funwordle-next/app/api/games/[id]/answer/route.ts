// app/api/games/[id]/answer/route.ts
import { NextResponse } from "next/server";
import { gameStoreProvider } from "@/app/domain/game/gameStoreProvider";
import type { AnswerDTO } from "@/app/lib/types";
import { fetchExplanations } from "@/app/domain/client/dictionaryApiClient";


export const runtime = "nodejs";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _req: Request,
   context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  // 1) invalid guid -> 400
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "InvalidGameId" },
      { status: 400 }
    );
  }

  // 2) not found -> 404
  const board = gameStoreProvider.tryGet(id);
  if (!board) {
    return NextResponse.json(
      { error: "GameNotFound" },
      { status: 404 }
    );
  }

  // 3) game not finished -> 401
  if (!board.isFinished) {
    return NextResponse.json(
      { error: "GameNotFinished" },
      { status: 401 }
    );
  }
  const word = board.getAnswer();
  const explanation = await fetchExplanations(word);
  // 4) finished -> 200 + answer
  const dto: AnswerDTO = { 
    answer: board.getAnswer(), 
    explanation:explanation
};
  return NextResponse.json(dto, { status: 200 });
}
