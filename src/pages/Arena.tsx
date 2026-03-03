import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameGrid from '../components/arena/GameGrid';
import FighterPanel from '../components/arena/FighterPanel';
import BroadcastPanel from '../components/arena/BroadcastPanel';
import EventLog from '../components/arena/EventLog';
import SpeedControl from '../components/arena/SpeedControl';
import EliminationBanner from '../components/arena/EliminationBanner';
import { useGame } from '../hooks/useGame';

export default function Arena() {
  const navigate = useNavigate();
  const {
    round, phase, isRunning, speed, zoneRadius,
    latestElimination, runGameLoop, startGame, apiKey, players,
  } = useGame();

  const [showElim, setShowElim] = useState(false);
  const [elimPlayer, setElimPlayer] = useState<typeof latestElimination>(null);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false);

  const aliveCount = players.filter(p => p.alive).length;

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
      const t = setTimeout(() => navigate('/results'), 2500);
      return () => clearTimeout(t);
    }
  }, [phase, navigate]);

  const tick = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try { await runGameLoop(); } finally { isProcessingRef.current = false; }
  }, [runGameLoop]);

  useEffect(() => {
    if (!isRunning || phase !== 'playing') return;
    // Fast! 400ms base at 1x, brief pause on elim
    const delay = showElim ? 1200 : (400 / speed);
    loopRef.current = setTimeout(() => { tick(); }, delay);
    return () => { if (loopRef.current) clearTimeout(loopRef.current); };
  }, [isRunning, phase, speed, round, tick, showElim]);

  if (!apiKey) { navigate('/'); return null; }

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
            COLOSSEUM
          </h1>
          <div className="flex items-center gap-1.5 bg-arena-panel/60 px-3 py-1 rounded-md border border-arena-border/30">
            <span className="font-pixel text-[10px] text-white">RD {round}</span>
            <span className="text-arena-border/60">|</span>
            <span className="font-mono text-[10px] text-gray-400">{aliveCount} alive</span>
            <span className="text-arena-border/60">|</span>
            <span className="font-mono text-[10px] text-arena-red">Zone: {zoneRadius}</span>
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

      {/* Main content — fills entire remaining space */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* Left: Game Grid centered */}
        <div className="flex items-center justify-center shrink-0">
          <GameGrid />
        </div>

        {/* Right: Panels fill all remaining space */}
        <div className="flex-1 flex flex-col gap-2 min-w-[280px] overflow-hidden">
          {/* Fighters — takes ~35% */}
          <div className="flex-[3.5] overflow-hidden min-h-0">
            <FighterPanel />
          </div>
          {/* Chat — takes ~35% */}
          <div className="flex-[3.5] overflow-hidden min-h-0">
            <BroadcastPanel />
          </div>
          {/* Event log — takes ~30% */}
          <div className="flex-[3] overflow-hidden min-h-0">
            <EventLog />
          </div>
        </div>
      </div>

      {/* Elimination banner overlay */}
      <EliminationBanner
        player={showElim ? elimPlayer : null}
        onDismiss={() => setShowElim(false)}
      />
    </motion.div>
  );
}
