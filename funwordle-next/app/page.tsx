'use client';

import { useEffect, useState } from 'react';
import { getConfig, createGame, getGame, startGame, submitGuess, getAnswer } from './lib/api';
import { AnswerDTO, GameStatusDto, KeyInput, type ConfigDto, type GameStateDto } from './lib/types';
import { GameBoard } from './components/GameBoard';
import { RulesPanel } from './components/RulesPanel';
import { getErrorMessage, toKeyInputFromKeyboardEvent } from './lib/util';
import { GameFooter } from './components/GameFooter';
import { MobileTypingFocus } from './components/MobileTypeFocus';

const WORD_LENGTH = 5; // fixed by game rules


export default function HomePage() {
  const [config, setConfig] = useState<ConfigDto | null>(null);
  const [game, setGame] = useState<GameStateDto | null>(null);
  const [answer, setAnswer] = useState<AnswerDTO | null>(null);

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

  async function applyKeyInput(input: KeyInput) {
  if (!game || isLoading) return;
  if (game.status !== GameStatusDto.InProgress || game.remainingGuesses <= 0) return;

  if (input?.kind === "backspace") {
    if (!currentGuess) return;
    const newGuess = currentGuess.slice(0, -1);
    await handleChangeCurrentGuess(newGuess);
    return;
  }

  if (input?.kind === "enter") {
    if (currentGuess.length === WORD_LENGTH) {
      await handleSubmitCurrentGuess(currentGuess);
    } else {
      triggerShake(`Please enter exactly ${WORD_LENGTH} letters.`);
    }
    return;
  }

  // letter
  if (currentGuess.length >= WORD_LENGTH) return;

  const newGuess = (currentGuess + input?.value).slice(0, WORD_LENGTH);
  await handleChangeCurrentGuess(newGuess);

  if (newGuess.length === WORD_LENGTH) {
    await handleSubmitCurrentGuess(newGuess);
  }
}



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
          setGame(g);
          setVisualTimeLeft(g.remainingTimeSeconds);
          setTimerActive(false);
          setHasStarted(false);
        }
        else
        {
          setGame(g);
          setVisualTimeLeft(g.remainingTimeSeconds);
          if(g.status!==GameStatusDto.InProgress)
            setTimerActive(false);
          else
            setTimerActive(true);
          setHasStarted(true);
        }
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

  useEffect(() => {const load = async () => {
    if (game?.status!==GameStatusDto.InProgress) {
      let answer: AnswerDTO | null = null;
      const storedId = typeof window !== 'undefined'
          ? window.localStorage.getItem('wordle-game-id')
          : null;
      if (storedId) {
        try {
          answer = await getAnswer(storedId);
        }catch {
          answer = null;
        }
      }
      setAnswer(answer);
    }
  }
  load();
  }, [game]);

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
      } catch (e: unknown) {
        const errMsg = getErrorMessage(e, 'Failed to start game.')
        setErrorMessage(errMsg);
      }
    }

    setCurrentGuess(newGuess);
    setErrorMessage(null);
  };

  const handleSubmitCurrentGuess = async (guessSubmit?:string) => {
    if (!game || !config) return;
    if (game.status !== GameStatusDto.InProgress || game.remainingGuesses <= 0) return;

    const trimmed = (guessSubmit??currentGuess).trim().toUpperCase();

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
        triggerShake("Please enter a valid 5-letter English word");
        return;
      }

      // 5. valid guess -> update board
      setGame(result.game);
      setCurrentGuess('');

      if (result.game.status !== GameStatusDto.InProgress) {
        // 6. game finished -> stop timer, no more input
        setTimerActive(false);
      }
    } catch (e: unknown) {
      const errMsg = getErrorMessage(e, 'Failed to submit guess.')
      triggerShake(errMsg);
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
    } catch (e: unknown) {
      const errMsg = getErrorMessage(e, 'Failed to restart game.')
      setErrorMessage(errMsg);
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

  // AFTER
return (
  <main>   
    <MobileTypingFocus className={'main-container'}onKeyDown={(e)=>{
    if (e.metaKey || e.ctrlKey || e.altKey) return;
        const key = e.key;
        let keyInput:KeyInput=null;
        if (key === "Backspace") keyInput = { kind: "backspace" };
        else if (key === "Enter") keyInput = { kind: "enter" };
        else if (/^[a-zA-Z]$/.test(key)) keyInput = { kind: "letter", value: key.toUpperCase() };

        if (!keyInput) return;

        e.preventDefault();
        void applyKeyInput(keyInput);
    }} enabled={game&&!isLoading}>
      <h1 className="page-title">FunWordle</h1>
      <RulesPanel initiallyOpen />
      <div className={isShaking ? 'shake game-wrapper' : 'game-wrapper'}>
        
        <GameBoard
          game={{ ...game, remainingTimeSeconds: visualTimeLeft }}
          maxGuessCount={config.maxGuessCount}
          wordLength={WORD_LENGTH}
          currentGuess={currentGuess}
          onChangeCurrentGuess={handleChangeCurrentGuess}
          onSubmitCurrentGuess={handleSubmitCurrentGuess}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      </div>

      <div className="bottom-bar">
        <div className="mb-4">
          <button
            onClick={handleRestart}
            disabled={isSubmitting}
            className="primary-button"
          >
            New Game
          </button>
        </div>

        {<GameFooter isFinished={isFinished} answer={answer}/>}

      </div>
    </MobileTypingFocus>
    

  </main>
);

}


