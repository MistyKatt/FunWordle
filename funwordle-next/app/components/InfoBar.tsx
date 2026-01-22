'use client';

import React from 'react';

export interface InfoBarProps {
  score: number;
  remainingTimeSeconds: number;
  remainingGuesses: number;
}

export const InfoBar: React.FC<InfoBarProps> = ({
  score,
  remainingTimeSeconds,
  remainingGuesses,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        marginBottom: 12,
        fontSize: 14,
      }}
    >
      <span>
        Score: <strong>{score}</strong>
      </span>
      <span>
        Time left: <strong>{remainingTimeSeconds}s</strong>
      </span>
      <span>
        Guesses left: <strong>{remainingGuesses}</strong>
      </span>
    </div>
  );
};
