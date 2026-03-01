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
      const t = setTimeout(() => navigate(`/results/${gameId || currentGameId}`), 2500);
      return () => clearTimeout(t);
    }
  }, [phase, navigate, gameId, currentGameId]);

  const tick = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try { await runGameLoop(); } finally { isProcessingRef.current = false; }
  }, [runGameLoop]);

  useEffect(() => {
    if (!isRunning || phase !== 'playing') return;
    const delay = showElim ? 1200 : (400 / speed);
    loopRef.current = setTimeout(() => { tick(); }, delay);
    return () => { if (loopRef.current) clearTimeout(loopRef.current); };
  }, [isRunning, phase, speed, round, tick, showElim]);

  if (!apiKey) { navigate('/'); return null; }

  // Get the game definition for rendering
  let GameArenaContent: React.ComponentType<any>;
  try {
    const game = getGame((gameId || currentGameId) as GameId);
    GameArenaContent = game.ArenaComponent;
  } catch {
    navigate('/');
    return null;
  }

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
            {'\u{1F3DF}\u{FE0F}'} COLOSSEUM
          </h1>
          <div className="flex items-center gap-1.5 bg-arena-panel/60 px-3 py-1 rounded-md border border-arena-border/30">
            <span className="font-pixel text-[10px] text-white">RD {round}</span>
            <span className="text-arena-border/60">|</span>
            <span className="font-mono text-[10px] text-gray-400">{aliveCount} alive</span>
            {currentGameId === 'battle-royale' && (
              <>
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
              GAME OVER
            </motion.span>
          )}
        </div>
        <SpeedControl />
      </div>

      {/* Game-specific arena content */}
      <GameArenaContent gameState={useGame.getState().gameState} />

      {/* Elimination banner overlay (battle royale) */}
      {currentGameId === 'battle-royale' && (
        <EliminationBanner
          player={showElim ? elimPlayer : null}
          onDismiss={() => setShowElim(false)}
        />
      )}
    </motion.div>
  );
}
