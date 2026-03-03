import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../hooks/useGame';
import { DebateState } from './types';

export default function DebateArena() {
  const { gameState } = useGame();
  const state = gameState as DebateState;
  if (!state?.players) return null;

  const forPlayer = state.players[0];
  const againstPlayer = state.players[1];

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
      {/* Topic banner */}
      <motion.div
        className="bg-arena-panel/80 border border-arena-border/40 rounded-xl p-4 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="font-pixel text-[9px] text-arena-accent block mb-1">TOPIC</span>
        <h2 className="font-pixel text-sm text-white">"{state.topic}"</h2>
        <p className="font-mono text-[10px] text-gray-500 mt-1">
          Round {state.round} of {state.maxRounds}
          {state.phase === 'playing' && (
            <motion.span
              className="ml-2 text-arena-accent"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              DEBATING...
            </motion.span>
          )}
        </p>
      </motion.div>

      {/* Score bar */}
      <div className="flex items-center gap-3 px-2">
        <span className="font-pixel text-[9px]" style={{ color: forPlayer.color }}>
          {state.totalScores[0]}
        </span>
        <div className="flex-1 h-3 bg-arena-dark rounded-full overflow-hidden flex">
          {state.totalScores[0] + state.totalScores[1] > 0 && (
            <>
              <motion.div
                className="h-full rounded-l-full"
                style={{ backgroundColor: forPlayer.color }}
                animate={{
                  width: `${(state.totalScores[0] / (state.totalScores[0] + state.totalScores[1])) * 100}%`
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
              <motion.div
                className="h-full rounded-r-full"
                style={{ backgroundColor: againstPlayer.color }}
                animate={{
                  width: `${(state.totalScores[1] / (state.totalScores[0] + state.totalScores[1])) * 100}%`
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </>
          )}
        </div>
        <span className="font-pixel text-[9px]" style={{ color: againstPlayer.color }}>
          {state.totalScores[1]}
        </span>
      </div>

      {/* Arguments */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* FOR side */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-3 px-2">
            <div>
              <h3 className="font-pixel text-[9px]" style={{ color: forPlayer.color }}>{forPlayer.nickname}</h3>
              <span className="font-mono text-[8px] text-green-400">FOR</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 px-1">
            <AnimatePresence>
              {state.arguments.filter(a => a.side === 'for').map((arg, i) => (
                <motion.div
                  key={`for-${arg.round}`}
                  className="bg-arena-panel/60 border-l-2 rounded-lg p-3"
                  style={{ borderColor: forPlayer.color }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="font-mono text-[9px] text-gray-500 block mb-1">Round {arg.round}</span>
                  <p className="font-mono text-xs text-gray-300 leading-relaxed">{arg.content}</p>
                  {state.scores[i] && (
                    <span className="font-pixel text-[8px] text-arena-gold mt-2 block">
                      Score: {state.scores[i].forScore}/10
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-px h-full bg-arena-border/30 relative">
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-arena-bg px-1">
              <span className="font-pixel text-[8px] text-gray-600">VS</span>
            </div>
          </div>
        </div>

        {/* AGAINST side */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-3 px-2 justify-end">
            <div className="text-right">
              <h3 className="font-pixel text-[9px]" style={{ color: againstPlayer.color }}>{againstPlayer.nickname}</h3>
              <span className="font-mono text-[8px] text-red-400">AGAINST</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 px-1">
            <AnimatePresence>
              {state.arguments.filter(a => a.side === 'against').map((arg, i) => (
                <motion.div
                  key={`against-${arg.round}`}
                  className="bg-arena-panel/60 border-r-2 rounded-lg p-3"
                  style={{ borderColor: againstPlayer.color }}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="font-mono text-[9px] text-gray-500 block mb-1">Round {arg.round}</span>
                  <p className="font-mono text-xs text-gray-300 leading-relaxed">{arg.content}</p>
                  {state.scores[i] && (
                    <span className="font-pixel text-[8px] text-arena-gold mt-2 block">
                      Score: {state.scores[i].againstScore}/10
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Judge reasoning */}
      {state.scores.length > 0 && (
        <div className="bg-arena-dark/60 border border-arena-border/20 rounded-lg p-3">
          <span className="font-pixel text-[8px] text-arena-gold block mb-1">JUDGE</span>
          <p className="font-mono text-[10px] text-gray-400">
            {state.scores[state.scores.length - 1].reasoning}
          </p>
        </div>
      )}
    </div>
  );
}
