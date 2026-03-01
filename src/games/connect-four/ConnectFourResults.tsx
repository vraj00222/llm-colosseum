import { motion } from 'framer-motion';
import { useGame } from '../../hooks/useGame';
import { ConnectFourState } from './types';

export default function ConnectFourResults() {
  const { gameState } = useGame();
  const state = gameState as ConnectFourState;
  if (!state) return null;

  const winner = state.winner;
  const loser = state.players.find(p => p.id !== winner?.id);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Winner announcement */}
      {winner ? (
        <motion.div
          className="text-center mb-12"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <motion.span
            className="text-7xl block mb-4"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            {'\u{1F3C6}'}
          </motion.span>
          <h1 className="font-pixel text-2xl mb-2" style={{ color: winner.color }}>
            {winner.nickname} WINS!
          </h1>
          <p className="font-mono text-sm text-gray-400">
            {winner.name} connected four in {state.round} moves
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-7xl block mb-4">{'\u{1F91D}'}</span>
          <h1 className="font-pixel text-2xl text-gray-400 mb-2">DRAW!</h1>
          <p className="font-mono text-sm text-gray-500">
            Board full after {state.round} moves. Neither model could win.
          </p>
        </motion.div>
      )}

      {/* Match summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {state.players.map((player, i) => (
          <motion.div
            key={player.id}
            className="bg-arena-panel border border-arena-border/50 rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            <span className="text-4xl block mb-3">{player.emoji}</span>
            <h3 className="font-pixel text-xs mb-1" style={{ color: player.color }}>
              {player.nickname}
            </h3>
            <p className="font-mono text-[10px] text-gray-500 mb-3">{player.name}</p>
            <div className="font-pixel text-lg">
              {winner?.id === player.id ? (
                <span className="text-arena-gold">{'\u{1F451}'} WINNER</span>
              ) : state.isDraw ? (
                <span className="text-gray-400">DRAW</span>
              ) : (
                <span className="text-gray-600">DEFEATED</span>
              )}
            </div>
            <p className="font-mono text-[10px] text-gray-600 mt-2">
              {state.moveHistory.filter(m => m.player === i + 1).length} moves played
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
