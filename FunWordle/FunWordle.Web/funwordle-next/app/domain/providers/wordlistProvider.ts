// src/server/wordList/fileWordListProvider.ts
import fs from "node:fs";
import path from "node:path";
import { ReadIntEnv, ReadStringEnv } from "@/app/lib/util";

export class WordListProvider {
  public readonly wordList: ReadonlySet<string>;

  constructor(filePath: string, wordLength: number = 5) {
    const resolved = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(resolved)) {
      throw new Error(`Word list file not found: ${resolved}`);
    }

    const lines = fs.readFileSync(resolved, "utf-8").split(/\r?\n/);

    const set = new Set<string>();
    for (const raw of lines) {
      const w = raw.trim().toUpperCase();
      if (w.length !== wordLength) continue;
      // Match your C# char.IsLetter intent but restricted to A-Z (Wordle).
      if (!/^[A-Z]+$/.test(w)) continue;
      set.add(w);
    }

    this.wordList = set;
    Object.freeze(this); // optional: prevent accidental mutation of fields
  }
}

export const wordListProvider = new WordListProvider(
    ReadStringEnv("WORDLE_FILEPATH", ""), 
    ReadIntEnv("WORDLE_WORD_LENGTH",5)
);
