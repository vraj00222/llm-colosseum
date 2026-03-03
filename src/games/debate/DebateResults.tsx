import { motion } from 'framer-motion';
import { useGame } from '../../hooks/useGame';
import { DebateState } from './types';

export default function DebateResults() {
  const { gameState } = useGame();
  const state = gameState as DebateState;
  if (!state) return null;

  const forPlayer = state.players[0];
  const againstPlayer = state.players[1];
  const isDraw = state.totalScores[0] === state.totalScores[1];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Winner / Draw */}
      <motion.div
        className="text-center mb-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        {state.winner ? (
          <>
            <h1 className="font-pixel text-xl mb-2" style={{ color: state.winner.color }}>
              {state.winner.nickname} WINS THE DEBATE!
            </h1>
            <p className="font-mono text-sm text-gray-400">
              {state.totalScores[0]} vs {state.totalScores[1]} over {state.maxRounds} rounds
            </p>
          </>
        ) : (
          <>
            <h1 className="font-pixel text-xl text-gray-400 mb-2">DEBATE DRAW!</h1>
            <p className="font-mono text-sm text-gray-500">
              Both models scored {state.totalScores[0]} points
            </p>
          </>
        )}
      </motion.div>

      {/* Topic */}
      <div className="bg-arena-panel/60 border border-arena-border/30 rounded-xl p-4 text-center mb-8">
        <span className="font-pixel text-[9px] text-arena-accent">TOPIC</span>
        <p className="font-pixel text-sm text-white mt-1">"{state.topic}"</p>
      </div>

      {/* Scores by round */}
      <div className="space-y-4 mb-8">
        {state.scores.map((score, i) => (
          <motion.div
            key={i}
            className="bg-arena-dark border border-arena-border/30 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-pixel text-[9px] text-gray-500">ROUND {score.round}</span>
              <span className="font-mono text-[10px] text-gray-600 italic">{score.reasoning}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`text-center p-3 rounded-lg ${score.forScore > score.againstScore ? 'bg-arena-accent/10 border border-arena-accent/20' : 'bg-arena-panel/40'}`}>
                <p className="font-pixel text-[9px] mt-1" style={{ color: forPlayer.color }}>{forPlayer.nickname}</p>
                <p className="font-pixel text-lg text-white mt-1">{score.forScore}</p>
                <p className="font-mono text-[8px] text-green-400">FOR</p>
              </div>
              <div className={`text-center p-3 rounded-lg ${score.againstScore > score.forScore ? 'bg-arena-accent/10 border border-arena-accent/20' : 'bg-arena-panel/40'}`}>
                <p className="font-pixel text-[9px] mt-1" style={{ color: againstPlayer.color }}>{againstPlayer.nickname}</p>
                <p className="font-pixel text-lg text-white mt-1">{score.againstScore}</p>
                <p className="font-mono text-[8px] text-red-400">AGAINST</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Final score */}
      <div className="bg-arena-panel border border-arena-gold/30 rounded-xl p-6 text-center">
        <span className="font-pixel text-[9px] text-arena-gold block mb-3">FINAL SCORE</span>
        <div className="flex items-center justify-center gap-8">
          <div>
            <p className="font-pixel text-[9px]" style={{ color: forPlayer.color }}>{forPlayer.nickname}</p>
            <p className="font-pixel text-2xl text-white mt-2">{state.totalScores[0]}</p>
          </div>
          <span className="font-pixel text-sm text-gray-600">vs</span>
          <div>
            <p className="font-pixel text-[9px]" style={{ color: againstPlayer.color }}>{againstPlayer.nickname}</p>
            <p className="font-pixel text-2xl text-white mt-2">{state.totalScores[1]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
