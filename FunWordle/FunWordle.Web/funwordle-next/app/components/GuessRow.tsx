'use client';

import React from 'react';
import { LetterBox } from './LetterBox';
import { LetterResultDto } from '../lib/types';

export interface GuessRowProps {
  wordLength: number;
  guess: string;
  results?: LetterResultDto[]; // optional until evaluated
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
  const chars = guess.padEnd(wordLength).split('').slice(0, wordLength);

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
            index={i}
            value={chars[i] ?? ''}
            match={letterResult?.match}
            isActive={isActive}
            onChange={handleLetterChange}
          />
        );
      })}
    </div>
  );
};
