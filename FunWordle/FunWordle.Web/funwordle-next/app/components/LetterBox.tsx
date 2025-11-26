// components/LetterBox.tsx
'use client';

import React from 'react';
import { LetterMatch } from '../lib/types';

export interface LetterBoxProps {
  index: number;
  value: string;
  match?: LetterMatch;
  isActive: boolean;      // can user type here?
  isEvaluated: boolean;   // is this a past guess with result?
  onChange?: (index: number, value: string) => void;
}

function getBackgroundColor(match: LetterMatch | undefined, isActive: boolean, isEvaluated: boolean): string {
  if (!isEvaluated) {
    // Active row or not-yet-used row
    return isActive ? '#ffffff' : '#e5e7eb'; // white / light gray
  }

  // Evaluated (past) row -> color by match
  switch (match) {
    case LetterMatch.Hit:
      return '#22c55e'; // green
    case LetterMatch.Present:
      return '#eab308'; // yellow
    case LetterMatch.Miss:
    default:
      return '#4b5563'; // gray
  }
}

function getTextColor(isEvaluated: boolean): string {
  return isEvaluated ? '#f9fafb' : '#111827'; // white on colored, dark on white
}

export const LetterBox: React.FC<LetterBoxProps> = ({
  index,
  value,
  match,
  isActive,
  isEvaluated,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange || !isActive) return;

    const raw = e.target.value;
    const char = raw.slice(-1).toUpperCase(); // keep last typed char
    onChange(index, char);
  };

  const backgroundColor = getBackgroundColor(match, isActive, isEvaluated);
  const color = getTextColor(isEvaluated);

  return (
    <input
      type="text"
      inputMode="text"
      maxLength={1}
      value={value.toUpperCase()}
      onChange={handleChange}
      // allow focus even if not active, but only active row reacts to typing
      disabled={false}
      style={{
        width: 40,
        height: 40,
        textAlign: 'center',
        fontSize: 24,
        textTransform: 'uppercase',
        marginRight: 4,
        borderRadius: 4,
        border: '1px solid #374151',
        backgroundColor,
        color,
      }}
    />
  );
};
