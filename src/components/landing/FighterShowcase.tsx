import { motion } from 'framer-motion';
import { PLAYER_CONFIGS } from '../../data/players';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const card = {
  hidden: { rotateY: 90, opacity: 0 },
  show: {
    rotateY: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 80, damping: 15 },
  },
};

export default function FighterShowcase() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <motion.h2
        className="font-pixel text-lg text-center text-arena-gold mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {'\u{1F465}'} MEET THE FIGHTERS
      </motion.h2>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-5"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-50px' }}
      >
        {PLAYER_CONFIGS.map((player) => (
          <motion.div
            key={player.id}
            variants={card}
            whileHover={{
              scale: 1.03,
              boxShadow: `0 0 30px ${player.color}40`,
            }}
            className="bg-arena-dark border border-arena-border rounded-xl p-6 relative overflow-hidden"
          >
            {/* Color accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: player.color }}
            />

            <div className="flex items-start gap-4">
              <span className="text-4xl">{player.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-pixel text-xs mb-1" style={{ color: player.color }}>
                  {player.nickname}
                </h3>
                <p className="font-mono text-xs text-gray-500 mb-2">
                  {player.name} &middot; {player.params}
                </p>
                <p className="font-mono text-xs text-gray-400 leading-relaxed">
                  {player.description}
                </p>
              </div>
            </div>

            {/* HP preview bar */}
            <div className="mt-4 bg-arena-bg rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: player.color }}
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
