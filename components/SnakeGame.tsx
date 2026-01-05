import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, SnakeScore } from '../lib/supabase';

const GRID_SIZE = 15;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export const SnakeGame: React.FC = () => {
  const { user, profile } = useAuth();
  const [snake, setSnake] = useState<Point[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Point>({ x: 10, y: 5 });
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  const directionRef = useRef(direction);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from('snake_scores')
      .select(`
        score,
        profiles (
          first_name,
          last_name
        )
      `)
      .order('score', { ascending: false })
      .limit(10);

    if (data) {
      const entries: LeaderboardEntry[] = data.map((item: any, index: number) => ({
        rank: index + 1,
        name: item.profiles ? `${item.profiles.first_name} ${item.profiles.last_name.charAt(0)}.` : 'Unknown',
        score: item.score,
      }));
      setLeaderboard(entries);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const saveScore = async (finalScore: number) => {
    if (!user || finalScore === 0) return;

    await supabase.from('snake_scores').insert({
      user_id: user.id,
      score: finalScore,
    });

    fetchLeaderboard();
  };

  const generateFood = useCallback((): Point => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }, []);

  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }]);
    setFood(generateFood());
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
    setShowLeaderboard(false);
  };

  const endGame = useCallback((finalScore: number) => {
    setGameOver(true);
    setIsPlaying(false);
    setShowLeaderboard(true);
    saveScore(finalScore);
  }, [user]);

  const moveSnake = useCallback(() => {
    if (gameOver || !isPlaying) return;

    const newHead = {
      x: snake[0].x + directionRef.current.x,
      y: snake[0].y + directionRef.current.y,
    };

    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE ||
      snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
    ) {
      endGame(score);
      return;
    }

    const newSnake = [newHead, ...snake];

    if (newHead.x === food.x && newHead.y === food.y) {
      setScore((s) => s + 1);
      setFood(generateFood());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, food, gameOver, isPlaying, generateFood, score, endGame]);

  useEffect(() => {
    const interval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (directionRef.current.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (directionRef.current.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (directionRef.current.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-sand-800 font-bold flex justify-between w-full px-4">
        <span>SCORE: {score}</span>
        <span>{gameOver ? "GAME OVER" : isPlaying ? "PLAYING" : "READY"}</span>
      </div>

      <div
        className="bg-sand-200 border-4 border-sand-700 relative box-content"
        style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE
        }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{backgroundImage: `linear-gradient(#896646 1px, transparent 1px), linear-gradient(90deg, #896646 1px, transparent 1px)`, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`}}></div>

        {snake.map((segment, i) => (
          <div
            key={`${segment.x}-${segment.y}-${i}`}
            className="absolute bg-ocean-500 border border-sand-200"
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              borderRadius: i === 0 ? '4px' : '0'
            }}
          />
        ))}

        <div
          className="absolute bg-orange-500 rounded-full animate-pulse"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        />

        {gameOver && (
             <div className="absolute inset-0 bg-sand-900/50 flex items-center justify-center text-white font-bold">
                 <span>CRASHED!</span>
             </div>
        )}
      </div>

      <button
        onClick={resetGame}
        className="mt-6 px-6 py-2 bg-sand-700 text-sand-100 font-bold uppercase tracking-widest border-2 border-sand-900 hover:bg-sand-600 active:translate-y-1 shadow-[4px_4px_0_#71543d]"
      >
        {gameOver ? "Try Again" : "Start Game"}
      </button>

      <p className="mt-4 text-xs text-sand-600 text-center">Use Arrow Keys to Move</p>
      {!user && (
        <p className="mt-2 text-xs text-ocean-600 text-center">Sign in to save your scores!</p>
      )}

      {showLeaderboard && leaderboard.length > 0 && (
        <div className="mt-4 w-full bg-sand-100 border-2 border-sand-500 rounded p-3">
          <h3 className="text-sm font-bold text-sand-800 mb-3 text-center border-b border-sand-400 pb-2">
            TOP 10 SCORES
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center text-xs ${entry.rank <= 3 ? 'font-bold' : ''}`}
              >
                <span className={`w-5 ${entry.rank === 1 ? 'text-yellow-600' : entry.rank === 2 ? 'text-gray-500' : entry.rank === 3 ? 'text-orange-600' : 'text-sand-600'}`}>
                  {entry.rank}.
                </span>
                <span className="flex-1 truncate text-sand-800">{entry.name}</span>
                <span className="text-ocean-600 font-mono ml-1">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
