'use client';

import { useEffect, useState } from 'react';
import { getConfig, createGame, getGame, startGame, submitGuess } from './lib/api';
import { GameStatusDto, type ConfigDto, type GameStateDto } from './lib/types';
import { GameBoard } from './components/GameBoard';
import { RulesPanel } from './components/RulesPanel';

const WORD_LENGTH = 5; // fixed by game rules

export default function HomePage() {
  const [config, setConfig] = useState<ConfigDto | null>(null);
  const [game, setGame] = useState<GameStateDto | null>(null);

  const [currentGuess, setCurrentGuess] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [visualTimeLeft, setVisualTimeLeft] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const [isShaking, setIsShaking] = useState(false);


  const triggerShake = (message?: string) => {
    if (message) {
      setErrorMessage(message);
    }
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };


  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const cfg = await getConfig();
        setConfig(cfg);

        const storedId = typeof window !== 'undefined'
          ? window.localStorage.getItem('wordle-game-id')
          : null;

        let g: GameStateDto | null = null;

        if (storedId) {
          try {
            g = await getGame(storedId);
          } catch {
            g = null;
          }
        }

        if (!g) {
          g = await createGame();
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('wordle-game-id', g.gameId);
          }
        }

        setGame(g);
        setVisualTimeLeft(g.remainingTimeSeconds);
        setTimerActive(false);
        setHasStarted(false);
        setCurrentGuess('');
      } catch (e: any) {
        setErrorMessage(e?.message ?? 'Failed to initialize game.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);


  useEffect(() => {
    if (!timerActive) return;
    if (visualTimeLeft <= 0) return;

    const id = setInterval(() => {
      setVisualTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [timerActive, visualTimeLeft]);

  // whenever server game state changes, resync visual time
  useEffect(() => {
    if (game) {
      setVisualTimeLeft(game.remainingTimeSeconds);
    }
  }, [game]);

  // ---------- handlers ----------

  const handleChangeCurrentGuess = async (newGuess: string) => {
    if (!game) return;
    if (game.status !== GameStatusDto.InProgress || game.remainingGuesses <= 0) return;

    // Start game on first character input
    if (!hasStarted && newGuess.length > 0) {
      try {
        const updated = await startGame(game.gameId);
        setGame(updated);
        setVisualTimeLeft(updated.remainingTimeSeconds);
        setTimerActive(true);
        setHasStarted(true);
      } catch (e: any) {
        setErrorMessage(e?.message ?? 'Failed to start game.');
      }
    }

    setCurrentGuess(newGuess);
    setErrorMessage(null);
  };

  const handleSubmitCurrentGuess = async () => {
    if (!game || !config) return;
    if (game.status !== GameStatusDto.InProgress || game.remainingGuesses <= 0) return;

    const trimmed = currentGuess.trim().toUpperCase();

    // 3. prevent submit if not exactly 5 chars -> shaking effect
    if (trimmed.length !== WORD_LENGTH) {
      triggerShake(`Please enter exactly ${WORD_LENGTH} letters.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const result = await submitGuess(game.gameId, trimmed);

      if (!result.ok) {
        // 4. failed validation on server -> shaking
        setGame(result.game);
        triggerShake(result.error);
        return;
      }

      // 5. valid guess -> update board
      setGame(result.game);
      setCurrentGuess('');

      if (result.game.status !== GameStatusDto.InProgress) {
        // 6. game finished -> stop timer, no more input
        setTimerActive(false);
      }
    } catch (e: any) {
      triggerShake(e?.message ?? 'Failed to submit guess.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const g = await createGame();
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('wordle-game-id', g.gameId);
      }
      setGame(g);
      setCurrentGuess('');
      setVisualTimeLeft(g.remainingTimeSeconds);
      setTimerActive(false);
      setHasStarted(false);
    } catch (e: any) {
      setErrorMessage(e?.message ?? 'Failed to restart game.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !config || !game) {
    return (
      <main style={{ padding: 24 }}>
        <h1 className="page-title">FunWordle</h1>
        <p>Loading...</p>
      </main>
    );
  }

  const isFinished = game.status !== GameStatusDto.InProgress;

  return (
    <main
      style={{
        padding: 24,
        maxWidth: 600,
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <h1 className="page-title">FunWordle</h1>

      <RulesPanel initiallyOpen />

      <div className={isShaking ? 'shake' : ''}>
        <GameBoard
          game={{
            ...game,
            remainingTimeSeconds: visualTimeLeft,
          }}
          maxGuessCount={config.maxGuessCount}
          wordLength={WORD_LENGTH}
          currentGuess={currentGuess}
          onChangeCurrentGuess={handleChangeCurrentGuess}
          onSubmitCurrentGuess={handleSubmitCurrentGuess}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={handleRestart} disabled={isSubmitting}>
          New Game
        </button>
        {isFinished && (
          <span style={{ marginLeft: 8 }}>
            Game finished. Start a new one to play again.
          </span>
        )}
      </div>
    </main>
  );
}
