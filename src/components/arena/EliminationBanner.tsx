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
          onAnimationComplete={() => setTimeout(onDismiss, 800)}
        >
          <motion.div
            className="absolute inset-0 bg-red-900/40"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
          <motion.div
            className="text-center"
            initial={{ scale: 2.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <h2 className="font-pixel text-base text-red-500 mb-0.5">ELIMINATED</h2>
            <p className="font-pixel text-sm" style={{ color: player.color }}>
              {player.nickname}
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
