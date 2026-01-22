// app/api/config/route.ts
import { NextResponse } from "next/server";
import type { ConfigDto } from "@/app/lib/types";
import {ReadIntEnv} from "@/app/lib/util"

export const runtime = "nodejs";


export async function GET() {
  const dto: ConfigDto = {
    maxGuessCount: ReadIntEnv("WORDLE_MAX_GUESS_COUNT", 6),
    initialTimeSeconds: ReadIntEnv("WORDLE_INITIAL_TIME_SECONDS", 120),
  };

  return NextResponse.json(dto, { status: 200 });
}
