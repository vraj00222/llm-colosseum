import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SpeedControl from '../components/arena/SpeedControl';
import EliminationBanner from '../components/arena/EliminationBanner';
import { useGame } from '../hooks/useGame';
import { getGame } from '../games/registry';
import { GameId } from '../games/types';

export default function GameArena() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const {
    round, phase, isRunning, speed, zoneRadius, currentGameId,
    latestElimination, runGameLoop, startGame, selectGame, apiKey, players,
  } = useGame();

  const [showElim, setShowElim] = useState(false);
  const [elimPlayer, setElimPlayer] = useState<typeof latestElimination>(null);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false);

  const activeGameId = (gameId || currentGameId) as GameId;
  const isBattleRoyale = activeGameId === 'battle-royale';
  const aliveCount = players.filter(p => p.alive).length;

  // Set game from URL param
  useEffect(() => {
    if (gameId && gameId !== currentGameId) {
      selectGame(gameId as GameId);
    }
  }, [gameId, currentGameId, selectGame]);

  useEffect(() => {
    if (phase === 'lobby') startGame();
  }, [phase, startGame]);

  useEffect(() => {
    if (latestElimination) {
      setElimPlayer(latestElimination);
      setShowElim(true);
    }
  }, [latestElimination]);

  useEffect(() => {
    if (phase === 'finished') {
      const delay = isBattleRoyale ? 2500 : 1500;
      const t = setTimeout(() => navigate(`/results/${activeGameId}`), delay);
      return () => clearTimeout(t);
    }
  }, [phase, navigate, activeGameId, isBattleRoyale]);

  const tick = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try { await runGameLoop(); } finally { isProcessingRef.current = false; }
  }, [runGameLoop]);

  useEffect(() => {
    if (!isRunning || phase !== 'playing') return;
    // Different speeds for different games
    let baseDelay = 400;
    if (activeGameId === 'connect-four') baseDelay = 1500; // slower for visual disc drops
    if (activeGameId === 'debate') baseDelay = 2000; // slower for reading arguments

    const delay = showElim ? 1200 : (baseDelay / speed);
    loopRef.current = setTimeout(() => { tick(); }, delay);
    return () => { if (loopRef.current) clearTimeout(loopRef.current); };
  }, [isRunning, phase, speed, round, tick, showElim, activeGameId]);

  if (!apiKey) { navigate('/'); return null; }

  // Get the game definition for rendering
  let game;
  try {
    game = getGame(activeGameId);
  } catch {
    navigate('/');
    return null;
  }

  const GameArenaContent = game.ArenaComponent;

  return (
    <motion.div
      className="arena-lock w-screen bg-arena-bg flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-arena-border/40 shrink-0 bg-arena-dark/60">
        <div className="flex items-center gap-5">
          <h1 className="font-pixel text-[11px] text-arena-accent tracking-wider">
            {game.emoji} {game.name.toUpperCase()}
          </h1>
          <div className="flex items-center gap-1.5 bg-arena-panel/60 px-3 py-1 rounded-md border border-arena-border/30">
            <span className="font-pixel text-[10px] text-white">
              {activeGameId === 'connect-four' ? `MOVE ${round}` : `RD ${round}`}
            </span>
            {isBattleRoyale && (
              <>
                <span className="text-arena-border/60">|</span>
                <span className="font-mono text-[10px] text-gray-400">{aliveCount} alive</span>
                <span className="text-arena-border/60">|</span>
                <span className="font-mono text-[10px] text-arena-red">Zone: {zoneRadius}</span>
              </>
            )}
          </div>
          {phase === 'finished' && (
            <motion.span
              className="font-pixel text-[11px] text-arena-gold"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {activeGameId === 'debate' ? 'DEBATE OVER' : 'GAME OVER'}
            </motion.span>
          )}
        </div>
        <SpeedControl />
      </div>

      {/* Game-specific arena content */}
      <GameArenaContent gameState={useGame.getState().gameState} />

      {/* Elimination banner overlay (battle royale only) */}
      {isBattleRoyale && (
        <EliminationBanner
          player={showElim ? elimPlayer : null}
          onDismiss={() => setShowElim(false)}
        />
      )}
    </motion.div>
  );
}
