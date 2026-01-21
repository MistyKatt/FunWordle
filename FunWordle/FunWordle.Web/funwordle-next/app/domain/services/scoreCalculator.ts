// src/domain/wordle/services/scoreCalculator.ts

import { GuessResult, LetterMatch } from "@/app/domain/models/guess";

export class ScoreCalculator {
  private readonly match = 200;
  private readonly exist = 50;

  /**
   * Equivalent to Calculate(int max, int time, GuessResult guess)
   * - max: previous "max" (your code uses Math.Max(max, currentScore))
   * - time: your time metric (you do `match*5 + time` on win)
   */
  public calculate(max: number, time: number, guess: GuessResult): number {
    if (guess == null) throw new Error("guess is required");

    if (guess.isWin) {
      return this.match * 5 + time;
    }

    let currentScore = 0;
    for (const score of guess.scores) {
      switch (score) {
        case LetterMatch.Hit:
          currentScore += this.match;
          break;
        case LetterMatch.Present:
          currentScore += this.exist;
          break;
        case LetterMatch.Miss:
        default:
          break;
      }
    }

    return Math.max(max, currentScore);
  }
}
