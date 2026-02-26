import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../engine/types';

interface EliminationBannerProps {
  player: Player | null;
  onDismiss: () => void;
}

export default function EliminationBanner({ player, onDismiss }: EliminationBannerProps) {
  return (
    <AnimatePresence>
      {player && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => setTimeout(onDismiss, 1800)}
        >
          <motion.div
            className="absolute inset-0 bg-red-900/50"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          />
          <motion.div
            className="text-center"
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 250, damping: 18 }}
          >
            <motion.span
              className="text-5xl block mb-2"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.4 }}
            >
              {'\u{1F480}'}
            </motion.span>
            <h2 className="font-pixel text-lg text-red-500 mb-1">ELIMINATED</h2>
            <p className="font-pixel text-sm" style={{ color: player.color }}>
              {player.emoji} {player.nickname}
            </p>
            {player.eliminatedBy && (
              <p className="font-mono text-xs text-gray-400 mt-0.5">by {player.eliminatedBy}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
