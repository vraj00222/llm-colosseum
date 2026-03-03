import { motion } from 'framer-motion';
import { Player } from '../../engine/types';

interface StandingsProps {
  players: Player[];
  eliminationOrder: Player[];
}

export default function Standings({ players, eliminationOrder }: StandingsProps) {
  // Build standings: winner first, then last eliminated to first eliminated
  const winner = players.find(p => p.alive);
  const eliminated = [...eliminationOrder].reverse();
  const standings = winner ? [winner, ...eliminated] : eliminated;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="font-pixel text-lg text-arena-gold text-center mb-6">
        FINAL STANDINGS
      </h2>

      <div className="space-y-2">
        {standings.map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`flex items-center gap-4 bg-arena-panel border border-arena-border rounded-lg p-4 ${
              i === 0 ? 'border-arena-gold' : ''
            }`}
          >
            <span className="font-pixel text-lg text-gray-500 w-8">
              #{i + 1}
            </span>
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: player.color, opacity: 0.8 }} />
            <div className="flex-1">
              <p className="font-pixel text-xs" style={{ color: player.color }}>
                {player.nickname}
              </p>
              <p className="font-mono text-xs text-gray-500">{player.name}</p>
            </div>
            <div className="text-right font-mono text-xs">
              {player.alive ? (
                <span className="text-arena-gold">WINNER</span>
              ) : (
                <span className="text-gray-500">
                  Eliminated Rd {player.eliminatedRound}
                  {player.eliminatedBy && ` by ${player.eliminatedBy}`}
                </span>
              )}
            </div>
            <div className="text-right font-mono text-xs text-gray-400 w-16">
              {player.kills > 0 && (
                <span className="text-arena-red">{player.kills} kills</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
