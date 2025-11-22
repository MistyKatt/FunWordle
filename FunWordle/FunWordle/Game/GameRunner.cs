using FunWordle.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FunWordle.Cli.Game
{
    
    public enum GameStatus
    {
        Init,
        Started,
        GameOver,
        Win
    }
    
    public class GameRunner
    {
        private readonly GameBoard _board;
        private GameStatus _status;
        
        public GameRunner(GameBoard board)
        {
            _board = board;
            _status = GameStatus.Init;
        }

        public void Run()
        {
            while (true)
            {
                switch(_status)
                {
                    case GameStatus.Init:
                        ShowWelcomeMessage();
                        Console.ReadKey();
                        _board.Initialize();
                        _status = GameStatus.Started;
                        break;
                    case GameStatus.Started:
                        RunStartedState();
                        break;

                    case GameStatus.Win:
                        ShowEndMessage(true);
                        break;

                    case GameStatus.GameOver:
                        ShowEndMessage(false);
                        break;
                }
            }
        }

        public void Reset()
        {

        }

        private void GuessHistory()
        {
            Console.WriteLine($"You have made the guesses below");
            foreach (var guess in _board.Guesses)
            {
                Console.WriteLine($"{ScoreLine(guess.Guess)}");
            }
        }

        private string ScoreLine(GuessResult guess)
        {
            StringBuilder sb = new StringBuilder();
            for(int i = 0; i< guess.Guess.Length; i++)
            {
                sb.Append(guess.Guess[i]);
                char r = 'U';
                switch(guess.Scores[i])
                {
                    case(LetterMatch.Hit):
                        r = 'H';
                        break;
                    case(LetterMatch.Miss):
                        r = 'M';
                        break;
                    case (LetterMatch.Present):
                        r = 'P';
                        break;
                    default:
                        break;

                }
                sb.Append($"[{r}] ");
            }
            return sb.ToString();
        }

        private void ShowWelcomeMessage()
        {
            Console.WriteLine("***********************************************************");
            Console.WriteLine("Welcome to the Wordle game! Press any key to start the game");
            Console.WriteLine("Guess the 5-letter word in N tries.\r\n[H] = correct letter & spot\r\n[P] = in word, wrong spot\r\n[M] = not in word");
            Console.WriteLine("***********************************************************");
        }

        private void RunStartedState()
        {
            if (_board.LastGuess != null && _board.LastGuess.IsWin)
            {
                _status = GameStatus.Win;
                return;
            }
            if (_board.Count <= 0)
            {
                _status = GameStatus.GameOver;
                return;
            }
            Console.WriteLine($"The remained guessed count is {_board.Count}");
            Console.WriteLine($"The current score is {_board.Score}");
            GuessHistory();
            Console.WriteLine($"Please make the next guess");
            string? guess = Console.ReadLine();
            try
            {
                _board.MakeGuess(guess);
            }
            catch (InvalidGuessException e)
            {
                Console.WriteLine($"The guess is invalid {e.Error}, please guess again");
            }
        }

        private void ShowEndMessage(bool isWin)
        {
            Console.WriteLine(isWin
            ? $"Congratulations! You won! Score = {_board.Score}"
            : $"Unfortunately, You lost. Score = {_board.Score}");

            GuessHistory();
            Console.WriteLine("Press any key to restart...");
            Console.ReadKey();

            _status = GameStatus.Init;
        }
    }
}
