// components/GuessRow.tsx
'use client';

import React from 'react';
import { LetterBox } from './LetterBox';
import { LetterResultDto } from '../lib/types';

export interface GuessRowProps {
  wordLength: number;
  guess: string;
  results?: LetterResultDto[]; // defined for past guesses, undefined for active/empty
  isActive: boolean;
  onChangeGuess?: (newGuess: string) => void;
}

export const GuessRow: React.FC<GuessRowProps> = ({
  wordLength,
  guess,
  results,
  isActive,
  onChangeGuess,
}) => {
  const chars = guess.split('').slice(0, wordLength);
  const isEvaluated = !!results && results.length === wordLength;

  const handleLetterChange = (index: number, value: string) => {
    if (!onChangeGuess) return;

    const arr = chars.slice();
    arr[index] = value;
    const newGuess = arr.join('').trimEnd();
    onChangeGuess(newGuess);
  };

  return (
    <div style={{ display: 'flex', marginBottom: 6 }}>
      {Array.from({ length: wordLength }, (_, i) => {
        const letterResult = results?.[i];
        return (
          <LetterBox
            key={i}
            value={chars[i] ?? ''}
            match={letterResult?.match}
            isActive={isActive}
            isEvaluated={isEvaluated}
          />
        );
      })}
    </div>
  );
};
