import { motion } from 'framer-motion';
import Hero from '../components/landing/Hero';
import ApiKeyInput from '../components/landing/ApiKeyInput';
import GameSelector from '../components/landing/GameSelector';

export default function Home() {
  return (
    <motion.div
      className="min-h-screen bg-arena-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero />
      <ApiKeyInput />
      <GameSelector />

      {/* Footer */}
      <div className="text-center py-8 font-mono text-xs text-gray-600">
        Powered by Novita AI &middot; Built for chaos
      </div>
    </motion.div>
  );
}
