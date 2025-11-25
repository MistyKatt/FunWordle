'use client';

import React from 'react';
import { GameStateDto, GuessResultDto } from '../lib/types';
import { InfoBar } from './InfoBar';
import { GuessRow } from './GuessRow';

export interface GameBoardProps {
  game: GameStateDto;
  maxGuessCount: number;
  wordLength: number;
  currentGuess: string;
  onChangeCurrentGuess: (newGuess: string) => void;
  onSubmitCurrentGuess: () => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  game,
  maxGuessCount,
  wordLength,
  currentGuess,
  onChangeCurrentGuess,
  onSubmitCurrentGuess,
  isSubmitting,
  errorMessage,
}) => {
  const usedGuesses: GuessResultDto[] = game.guesses ?? [];
  const remainingRowCount = Math.max(0, maxGuessCount - usedGuesses.length - (game.status === 'InProgress' ? 1 : 0));
  const isFinished = game.status === 'Win' || game.status === 'Lose';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFinished && !isSubmitting) {
      onSubmitCurrentGuess();
    }
  };

  return (
    <div>
      <InfoBar
        score={game.score}
        remainingTimeSeconds={game.remainingTimeSeconds}
        remainingGuesses={game.remainingGuesses}
      />

      {errorMessage && (
        <div style={{ color: 'red', marginBottom: 8 }}>{errorMessage}</div>
      )}

      {/* Past guesses */}
      {usedGuesses.map((g, idx) => (
        <GuessRow
          key={idx}
          wordLength={wordLength}
          guess={g.guess}
          results={g.letters}
          isActive={false}
        />
      ))}

      {/* Active row */}
      {!isFinished && game.remainingGuesses > 0 && (
        <form onSubmit={handleSubmit}>
          <GuessRow
            wordLength={wordLength}
            guess={currentGuess}
            isActive={!isSubmitting}
            onChangeGuess={onChangeCurrentGuess}
          />
          <button
            type="submit"
            disabled={isSubmitting || currentGuess.length !== wordLength}
            style={{ marginTop: 4 }}
          >
            Guess
          </button>
        </form>
      )}

      {/* Empty rows */}
      {Array.from({ length: remainingRowCount }, (_, i) => (
        <GuessRow
          key={`empty-${i}`}
          wordLength={wordLength}
          guess=""
          isActive={false}
        />
      ))}

      {isFinished && (
        <div style={{ marginTop: 12 }}>
          {game.status === 'Win' ? (
            <span>🎉 You won!</span>
          ) : (
            <span>💀 Game over.</span>
          )}
        </div>
      )}
    </div>
  );
};
