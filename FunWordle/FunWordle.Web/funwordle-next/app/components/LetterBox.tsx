'use client';

import React from 'react';
import { LetterMatch } from '../lib/types';

export interface LetterBoxProps {
  index: number;
  value: string;
  match?: LetterMatch;
  isActive: boolean;
  onChange?: (index: number, value: string) => void;
}

function getBackgroundColor(match?: LetterMatch): string {
  if (match === undefined) return '#111827'; // neutral (dark gray)

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

export const LetterBox: React.FC<LetterBoxProps> = ({
  index,
  value,
  match,
  isActive,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    const raw = e.target.value;
    const char = raw.slice(-1).toUpperCase(); // keep only last typed char
    onChange(index, char);
  };

  const backgroundColor = getBackgroundColor(match);

  return (
    <input
      type="text"
      inputMode="text"
      maxLength={1}
      value={value.toUpperCase()}
      onChange={handleChange}
      disabled={!isActive}
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
        color: '#f9fafb',
      }}
    />
  );
};
