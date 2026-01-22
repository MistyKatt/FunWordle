// src/domain/wordle/services/wordEvaluator.ts

import { GuessResult, LetterMatch } from "@/app/domain/models/guess";

export class BasicWordEvaluator {
  public evaluateGuess(input: string, answer: string): GuessResult {
    if (answer == null) throw new Error("answer is required");
    if (input == null) throw new Error("input is required");
    if (answer.length !== input.length) {
      throw new Error("Answer and guess must have same length.");
    }

    const n = answer.length;
    const scores: LetterMatch[] = new Array(n);
    const remainingCounts = new Array<number>(26).fill(0);

    // pass 1: mark hits, count remaining letters in answer
    for (let i = 0; i < n; i++) {
      if (input[i] === answer[i]) {
        scores[i] = LetterMatch.Hit;
      } else {
        scores[i] = LetterMatch.Miss;
        const idx = answer.charCodeAt(i) - 65; // 'A'
        if (idx >= 0 && idx < 26) remainingCounts[idx]++;
      }
    }

    // pass 2: mark presents
    for (let i = 0; i < n; i++) {
      if (scores[i] === LetterMatch.Hit) continue;

      const idx = input.charCodeAt(i) - 65;
      if (idx >= 0 && idx < 26 && remainingCounts[idx] > 0) {
        scores[i] = LetterMatch.Present;
        remainingCounts[idx]--;
      }
    }

    // isWin
    let isWin = true;
    for (let i = 0; i < n; i++) {
      if (scores[i] !== LetterMatch.Hit) {
        isWin = false;
        break;
      }
    }

    return new GuessResult(input, scores, isWin);
  }
}

export const wordEvaluator = new BasicWordEvaluator();
