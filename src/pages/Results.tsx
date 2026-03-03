import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Champion from '../components/results/Champion';
import Standings from '../components/results/Standings';
import PostGameInterview from '../components/results/PostGameInterview';
import { useGame } from '../hooks/useGame';

export default function Results() {
  const navigate = useNavigate();
  const { winner, players, eliminationOrder, apiKey, resetGame } = useGame();

  const handlePlayAgain = () => {
    resetGame();
    navigate('/arena');
    // Small delay then start
    setTimeout(() => {
      useGame.getState().startGame();
    }, 100);
  };

  const handleHome = () => {
    resetGame();
    navigate('/');
  };

  return (
    <motion.div
      className="min-h-screen bg-arena-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {winner && <Champion winner={winner} />}

      <Standings players={players} eliminationOrder={eliminationOrder} />

      <PostGameInterview
        players={players}
        winner={winner}
        apiKey={apiKey}
      />

      {/* Action buttons */}
      <div className="flex justify-center gap-4 py-12">
        <motion.button
          onClick={handlePlayAgain}
          className="font-pixel text-sm px-8 py-4 rounded-xl text-white"
          style={{
            background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          RUN AGAIN
        </motion.button>

        <motion.button
          onClick={handleHome}
          className="font-pixel text-sm px-8 py-4 rounded-xl text-gray-300 bg-arena-panel border border-arena-border"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          HOME
        </motion.button>
      </div>
    </motion.div>
  );
}
