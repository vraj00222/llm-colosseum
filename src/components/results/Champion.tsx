import { motion } from 'framer-motion';
import { Player } from '../../engine/types';

interface ChampionProps {
  winner: Player;
}

export default function Champion({ winner }: ChampionProps) {
  return (
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
    >
      <h1 className="font-pixel text-3xl text-arena-gold mb-2">CHAMPION</h1>

      <motion.div
        className="inline-block bg-arena-panel border-2 rounded-xl p-8 mt-4"
        style={{ borderColor: winner.color }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: winner.color, opacity: 0.8 }} />
        <h2 className="font-pixel text-xl mb-1" style={{ color: winner.color }}>
          {winner.nickname}
        </h2>
        <p className="font-mono text-sm text-gray-400">{winner.name} &middot; {winner.params}</p>
        <div className="flex gap-6 justify-center mt-4 font-mono text-sm">
          <div>
            <span className="text-gray-500">Survived</span>
            <span className="text-white ml-2">{winner.roundsSurvived} rounds</span>
          </div>
          <div>
            <span className="text-gray-500">Kills</span>
            <span className="text-arena-red ml-2">{winner.kills}</span>
          </div>
          <div>
            <span className="text-gray-500">HP</span>
            <span className="text-arena-green ml-2">{winner.hp}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
