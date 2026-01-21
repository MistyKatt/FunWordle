// src/domain/wordle/wordListProvider.ts

/**
 * Minimal contract for providing a word list.
 * Keep it simple for now; later you can swap it to file/db/remote.
 */
export type WordListProvider = {
  readonly wordList: ReadonlySet<string>;
};
