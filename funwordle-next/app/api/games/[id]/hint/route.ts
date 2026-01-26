// app/api/games/[id]/answer/route.ts
import { NextResponse } from "next/server";
import { gameProvider } from "@/app/domain/factory/gameStoreFactory";
import type { ExplanationDefinitionDto } from "@/app/lib/types";
import { fetchSingleExplanation } from "@/app/domain/client/dictionaryApiClient";


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
  const board = await gameProvider.tryGet(id);
  if (!board) {
    return NextResponse.json(
      { error: "GameNotFound" },
      { status: 404 }
    );
  }
  const word = board.getAnswer();
  const explanation = await fetchSingleExplanation(word);
  // 4) finished -> 200 + answer
  const dto: ExplanationDefinitionDto|null = explanation;
  return NextResponse.json(dto, { status: 200 });
}
