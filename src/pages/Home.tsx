import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../components/landing/Hero';
import RuleCards from '../components/landing/RuleCards';
import FighterShowcase from '../components/landing/FighterShowcase';
import ApiKeyInput from '../components/landing/ApiKeyInput';
import { useGame } from '../hooks/useGame';

export default function Home() {
  const navigate = useNavigate();
  const { apiKey, startGame } = useGame();

  const handleStart = () => {
    if (!apiKey) {
      alert('Please enter your Novita AI API key first!');
      return;
    }
    startGame();
    navigate('/play/battle-royale');
  };

  return (
    <motion.div
      className="min-h-screen bg-arena-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero />
      <RuleCards />
      <FighterShowcase />
      <ApiKeyInput />

      {/* Start Button */}
      <div className="text-center py-12">
        <motion.button
          onClick={handleStart}
          className="font-pixel text-lg px-12 py-5 rounded-xl text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
            boxShadow: '0 0 30px rgba(108, 92, 231, 0.4)',
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 50px rgba(108, 92, 231, 0.7)',
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(108, 92, 231, 0.3)',
              '0 0 40px rgba(108, 92, 231, 0.6)',
              '0 0 20px rgba(108, 92, 231, 0.3)',
            ],
          }}
          transition={{
            boxShadow: { duration: 2, repeat: Infinity },
          }}
        >
          {'\u{2694}\u{FE0F}'} START THE COLOSSEUM
        </motion.button>
      </div>

      {/* Footer */}
      <div className="text-center py-8 font-mono text-xs text-gray-600">
        Powered by Novita AI &middot; Built for chaos
      </div>
    </motion.div>
  );
}
