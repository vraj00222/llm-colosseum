import { motion } from 'framer-motion';
import { useGame } from '../../hooks/useGame';

const speeds = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
];

export default function SpeedControl() {
  const { speed, setSpeed, isRunning, pauseGame, resumeGame, phase } = useGame();
  if (phase === 'finished') return null;

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => isRunning ? pauseGame() : resumeGame()}
        className="bg-arena-panel border border-arena-border rounded-md px-3 py-1.5 font-mono text-xs text-white hover:border-arena-accent transition-colors"
      >
        {isRunning ? '\u{23F8}' : '\u{25B6}\u{FE0F}'}
      </motion.button>
      <div className="flex gap-1 bg-arena-dark/60 rounded-md p-0.5 border border-arena-border/30">
        {speeds.map(s => (
          <motion.button
            key={s.value}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setSpeed(s.value)}
            className={`px-2 py-1 rounded font-mono transition-colors ${
              speed === s.value
                ? 'bg-arena-accent text-white shadow-sm'
                : 'text-gray-500 hover:text-white'
            }`}
            style={{ fontSize: 10 }}
          >
            {s.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
