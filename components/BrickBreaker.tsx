import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 360;
const PADDLE_WIDTH = 70;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 36;
const BRICK_HEIGHT = 14;
const BRICK_PADDING = 3;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) / 2;
const INITIAL_BALL_SPEED = 5;
const PADDLE_SPEED = 8;

interface Brick {
  x: number;
  y: number;
  hp: number;
  alive: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

const COLORS = {
  background: '#f5f0e6',
  paddle: '#896646',
  ball: '#e97451',
  brick1: '#4a9c9c',
  brick2: '#3d8585',
  brick3: '#306b6b',
  text: '#5a4633',
  gridLine: '#d4c9b8',
};

export const BrickBreaker: React.FC = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, vx: 0, vy: 0 },
    bricks: [] as Brick[],
    score: 0,
    lives: 3,
    level: 1,
    isLaunched: false,
    gameOver: false,
    paused: false,
    ballSpeed: INITIAL_BALL_SPEED,
  });
  const keysRef = useRef({ left: false, right: false });
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from('brick_breaker_scores')
      .select(`
        score,
        level,
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

  const saveScore = async (finalScore: number, finalLevel: number) => {
    if (!user || finalScore === 0) return;
    await supabase.from('brick_breaker_scores').insert({
      user_id: user.id,
      score: finalScore,
      level: finalLevel,
    });
    fetchLeaderboard();
  };

  const generateBricks = useCallback((levelNum: number): Brick[] => {
    const bricks: Brick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        let hp = 1;
        if (levelNum >= 2 && row < 2) hp = 2;
        if (levelNum >= 3 && row === 0) hp = 3;
        bricks.push({
          x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
          hp,
          alive: true,
        });
      }
    }
    return bricks;
  }, []);

  const resetBall = useCallback(() => {
    const state = gameStateRef.current;
    state.ball.x = state.paddle.x + PADDLE_WIDTH / 2;
    state.ball.y = state.paddle.y - BALL_RADIUS - 2;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.isLaunched = false;
  }, []);

  const initGame = useCallback(() => {
    const state = gameStateRef.current;
    state.paddle.x = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
    state.score = 0;
    state.lives = 3;
    state.level = 1;
    state.gameOver = false;
    state.ballSpeed = INITIAL_BALL_SPEED;
    state.bricks = generateBricks(1);
    resetBall();
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setIsPlaying(true);
    setShowLeaderboard(false);
  }, [generateBricks, resetBall]);

  const launchBall = useCallback(() => {
    const state = gameStateRef.current;
    if (!state.isLaunched && !state.gameOver) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      state.ball.vx = Math.cos(angle) * state.ballSpeed;
      state.ball.vy = Math.sin(angle) * state.ballSpeed;
      state.isLaunched = true;
    }
  }, []);

  const endGame = useCallback(() => {
    const state = gameStateRef.current;
    state.gameOver = true;
    setGameOver(true);
    setIsPlaying(false);
    setShowLeaderboard(true);
    saveScore(state.score, state.level);
  }, [user]);

  const nextLevel = useCallback(() => {
    const state = gameStateRef.current;
    state.level += 1;
    state.ballSpeed = INITIAL_BALL_SPEED + (state.level - 1) * 0.5;
    state.bricks = generateBricks(state.level);
    state.score += 500;
    resetBall();
    setLevel(state.level);
    setScore(state.score);
  }, [generateBricks, resetBall]);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const update = useCallback(() => {
    const state = gameStateRef.current;
    if (state.gameOver || state.paused) return;

    if (keysRef.current.left) {
      state.paddle.x = Math.max(0, state.paddle.x - PADDLE_SPEED);
    }
    if (keysRef.current.right) {
      state.paddle.x = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, state.paddle.x + PADDLE_SPEED);
    }

    if (!state.isLaunched) {
      state.ball.x = state.paddle.x + PADDLE_WIDTH / 2;
      state.ball.y = state.paddle.y - BALL_RADIUS - 2;
      return;
    }

    state.ball.x += state.ball.vx;
    state.ball.y += state.ball.vy;

    if (state.ball.x - BALL_RADIUS <= 0) {
      state.ball.x = BALL_RADIUS;
      state.ball.vx = Math.abs(state.ball.vx);
    }
    if (state.ball.x + BALL_RADIUS >= CANVAS_WIDTH) {
      state.ball.x = CANVAS_WIDTH - BALL_RADIUS;
      state.ball.vx = -Math.abs(state.ball.vx);
    }
    if (state.ball.y - BALL_RADIUS <= 0) {
      state.ball.y = BALL_RADIUS;
      state.ball.vy = Math.abs(state.ball.vy);
    }

    const paddleTop = state.paddle.y;
    const paddleBottom = state.paddle.y + PADDLE_HEIGHT;
    const paddleLeft = state.paddle.x;
    const paddleRight = state.paddle.x + PADDLE_WIDTH;

    const closestX = clamp(state.ball.x, paddleLeft, paddleRight);
    const closestY = clamp(state.ball.y, paddleTop, paddleBottom);
    const dx = state.ball.x - closestX;
    const dy = state.ball.y - closestY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= BALL_RADIUS && state.ball.vy > 0) {
      const hitPos = (state.ball.x - (paddleLeft + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
      const maxAngle = Math.PI / 3;
      const angle = hitPos * maxAngle;
      state.ball.vx = Math.sin(angle) * state.ballSpeed;
      state.ball.vy = -Math.cos(angle) * state.ballSpeed;
      state.ball.y = paddleTop - BALL_RADIUS;
    }

    for (const brick of state.bricks) {
      if (!brick.alive) continue;

      const brickRight = brick.x + BRICK_WIDTH;
      const brickBottom = brick.y + BRICK_HEIGHT;

      const closestBrickX = clamp(state.ball.x, brick.x, brickRight);
      const closestBrickY = clamp(state.ball.y, brick.y, brickBottom);
      const brickDx = state.ball.x - closestBrickX;
      const brickDy = state.ball.y - closestBrickY;
      const brickDist = Math.sqrt(brickDx * brickDx + brickDy * brickDy);

      if (brickDist <= BALL_RADIUS) {
        brick.hp -= 1;
        if (brick.hp <= 0) {
          brick.alive = false;
        }
        state.score += 10;
        setScore(state.score);

        if (Math.abs(brickDx) > Math.abs(brickDy)) {
          state.ball.vx = -state.ball.vx;
        } else {
          state.ball.vy = -state.ball.vy;
        }
        break;
      }
    }

    if (state.ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
      state.lives -= 1;
      setLives(state.lives);
      if (state.lives <= 0) {
        endGame();
      } else {
        resetBall();
      }
    }

    if (state.bricks.every((b) => !b.alive)) {
      nextLevel();
    }
  }, [endGame, resetBall, nextLevel]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = gameStateRef.current;

    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    for (const brick of state.bricks) {
      if (!brick.alive) continue;
      let color = COLORS.brick1;
      if (brick.hp === 2) color = COLORS.brick2;
      if (brick.hp >= 3) color = COLORS.brick3;
      ctx.fillStyle = color;
      ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      ctx.strokeStyle = '#2a5555';
      ctx.lineWidth = 1;
      ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
    }

    ctx.fillStyle = COLORS.paddle;
    ctx.fillRect(state.paddle.x, state.paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.fillStyle = COLORS.ball;
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    if (state.gameOver) {
      ctx.fillStyle = 'rgba(90, 70, 51, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
  }, []);

  const gameLoop = useCallback(
    (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      lastTimeRef.current = time;
      update();
      render();
      animationRef.current = requestAnimationFrame(gameLoop);
    },
    [update, render]
  );

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = true;
      if (e.key === 'ArrowRight') keysRef.current.right = true;
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        launchBall();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false;
      if (e.key === 'ArrowRight') keysRef.current.right = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [launchBall]);

  const handleCanvasClick = () => {
    if (!isPlaying) {
      initGame();
    } else {
      launchBall();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-sand-800 font-bold flex justify-between w-full px-2 text-sm">
        <span>SCORE: {score}</span>
        <span>LIVES: {lives}</span>
        <span>LVL: {level}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-sand-700 cursor-pointer"
        onClick={handleCanvasClick}
      />

      <button
        onClick={gameOver || !isPlaying ? initGame : launchBall}
        className="mt-4 px-6 py-2 bg-sand-700 text-sand-100 font-bold uppercase tracking-widest border-2 border-sand-900 hover:bg-sand-600 active:translate-y-1 shadow-[4px_4px_0_#71543d]"
      >
        {gameOver ? 'Try Again' : isPlaying ? 'Launch Ball' : 'Start Game'}
      </button>

      <p className="mt-3 text-xs text-sand-600 text-center">Arrow Keys to Move / Space to Launch</p>
      {!user && <p className="mt-1 text-xs text-ocean-600 text-center">Sign in to save your scores!</p>}

      {showLeaderboard && leaderboard.length > 0 && (
        <div className="mt-4 w-full bg-sand-100 border-2 border-sand-500 rounded p-3">
          <h3 className="text-sm font-bold text-sand-800 mb-3 text-center border-b border-sand-400 pb-2">TOP 10 SCORES</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className={`flex items-center text-xs ${entry.rank <= 3 ? 'font-bold' : ''}`}>
                <span
                  className={`w-5 ${entry.rank === 1 ? 'text-yellow-600' : entry.rank === 2 ? 'text-gray-500' : entry.rank === 3 ? 'text-orange-600' : 'text-sand-600'}`}
                >
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
