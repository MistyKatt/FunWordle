// src/server/dictionary/dictionaryApiClient.ts

import type { ExplanationsDto } from "@/app/lib/types";

type DictionaryApiEntry = {
  word?: string;
  phonetic?: string;
  meanings?: Array<{
    partOfSpeech?: string;
    definitions?: Array<{
      definition?: string;
    }>;
  }>;
};

function pickMeanings(entry: DictionaryApiEntry, maxDefsPerPos = 3): ExplanationsDto | null {
  const word = (entry.word ?? "").trim();
  if (!word) return null;

  const meanings = (entry.meanings ?? [])
    .map(m => {
      const partOfSpeech = (m.partOfSpeech ?? "").trim();
      if (!partOfSpeech) return null;

      const definitions = (m.definitions ?? [])
        .map(d => (d.definition ?? "").trim())
        .filter(Boolean)
        .slice(0, maxDefsPerPos)
        .map(definition => ({ definition }));

      if (definitions.length === 0) return null;

      return { partOfSpeech, definitions };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  return {
    word,
    phonetic: entry.phonetic?.trim() || undefined,
    meanings,
  };
}

/**
 * Fetch explanations from dictionaryapi.dev.
 * Returns null if not found or response shape unexpected.
 */
export async function fetchExplanations(word: string): Promise<ExplanationsDto | null> {
  const normalized = word.trim().toLowerCase();
  if (!normalized) return null;

  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalized)}`;

  //words almost don't change.
  const res = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 * 7 }
    });

  // 404 means "No Definitions Found" for this API.
  if (res.status === 404) return null;
  if (!res.ok) return null;

  const json = (await res.json()) as unknown;

  if (!Array.isArray(json) || json.length === 0) return null;
  const entry = json[0] as DictionaryApiEntry;

  return pickMeanings(entry, 3);
}
