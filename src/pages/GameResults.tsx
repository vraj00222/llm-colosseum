import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../hooks/useGame';
import { getGame } from '../games/registry';
import { GameId } from '../games/types';

export default function GameResults() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { apiKey, resetGame, currentGameId } = useGame();

  const activeGameId = (gameId || currentGameId) as GameId;

  let ResultsContent: React.ComponentType<any>;
  try {
    const game = getGame(activeGameId);
    ResultsContent = game.ResultsComponent;
  } catch {
    navigate('/');
    return null;
  }

  const handlePlayAgain = () => {
    resetGame();
    navigate(`/play/${activeGameId}`);
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
      <ResultsContent gameState={useGame.getState().gameState} />

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
