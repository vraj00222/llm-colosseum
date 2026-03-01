import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAllGames } from '../../games';
import { useGame } from '../../hooks/useGame';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const card = {
  hidden: { y: 40, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 14 },
  },
};

const tagColors: Record<string, string> = {
  combat: '#ef4444',
  strategy: '#3b82f6',
  alliances: '#8b5cf6',
  classic: '#f59e0b',
  visual: '#06b6d4',
  debate: '#ec4899',
  persuasion: '#f97316',
  'game-theory': '#10b981',
  drama: '#e11d48',
  knowledge: '#6366f1',
  speed: '#14b8a6',
};

export default function GameSelector() {
  const navigate = useNavigate();
  const { apiKey, selectGame } = useGame();
  const games = getAllGames();

  const handleSelect = (gameId: string) => {
    if (!apiKey) {
      alert('Please enter your Novita AI API key first!');
      return;
    }
    selectGame(gameId as any);
    navigate(`/setup/${gameId}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <motion.h2
        className="font-pixel text-lg text-center text-arena-gold mb-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {'\u{1F3AE}'} CHOOSE YOUR GAME
      </motion.h2>
      <motion.p
        className="font-mono text-sm text-gray-500 text-center mb-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Pick a game, choose your fighters, and watch AI battle it out.
      </motion.p>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-50px' }}
      >
        {games.map((game) => (
          <motion.div
            key={game.id}
            variants={card}
            whileHover={{
              scale: 1.03,
              boxShadow: '0 0 30px rgba(108, 92, 231, 0.3)',
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(game.id)}
            className="bg-arena-dark border border-arena-border rounded-xl p-6 cursor-pointer relative overflow-hidden group"
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-arena-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{game.emoji}</span>
                <div>
                  <h3 className="font-pixel text-xs text-white">{game.name}</h3>
                  <p className="font-mono text-[10px] text-gray-500">
                    {game.playerCount.min === game.playerCount.max
                      ? `${game.playerCount.min} players`
                      : `${game.playerCount.min}-${game.playerCount.max} players`}
                    {' \u{00B7} '}
                    {game.estimatedDuration}
                  </p>
                </div>
              </div>

              <p className="font-mono text-xs text-gray-400 leading-relaxed mb-4">
                {game.tagline}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[9px] px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${tagColors[tag] || '#6b7280'}20`,
                      color: tagColors[tag] || '#9ca3af',
                      border: `1px solid ${tagColors[tag] || '#6b7280'}30`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
