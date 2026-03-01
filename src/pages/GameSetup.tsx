import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../hooks/useGame';
import { getGame } from '../games/registry';
import { GameId, PlayerConfig } from '../games/types';
import { PLAYER_CONFIGS } from '../data/players';

export default function GameSetup() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { apiKey, selectGame, setSelectedPlayers, startGame } = useGame();

  let game;
  try {
    game = getGame(gameId as GameId);
  } catch {
    navigate('/');
    return null;
  }

  const [selected, setSelected] = useState<Set<string>>(() => {
    // Pre-select all for battle royale, first N for others
    if (game.playerCount.max >= PLAYER_CONFIGS.length) {
      return new Set(PLAYER_CONFIGS.map(p => p.id));
    }
    return new Set(PLAYER_CONFIGS.slice(0, game.playerCount.min).map(p => p.id));
  });

  const [debateTopic, setDebateTopic] = useState('');

  const togglePlayer = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      if (next.size >= game!.playerCount.max) return;
      next.add(id);
    }
    setSelected(next);
  };

  const canStart = selected.size >= game.playerCount.min && selected.size <= game.playerCount.max;

  const handleStart = () => {
    if (!apiKey) {
      alert('Please enter your Novita AI API key first!');
      return;
    }
    if (!canStart) return;

    const players = PLAYER_CONFIGS.filter(p => selected.has(p.id));
    selectGame(gameId as GameId);
    setSelectedPlayers(players);

    // Store debate topic if applicable
    if (gameId === 'debate' && debateTopic.trim()) {
      localStorage.setItem('debate_topic', debateTopic.trim());
    }

    startGame();
    navigate(`/play/${gameId}`);
  };

  const suggestedTopics = [
    'Is a hotdog a sandwich?',
    'Tabs vs Spaces',
    'Pineapple on pizza',
    'AI will replace programmers',
    'Cats are better than dogs',
    'Dark mode vs light mode',
  ];

  return (
    <motion.div
      className="min-h-screen bg-arena-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="text-center pt-12 pb-6">
        <motion.button
          onClick={() => navigate('/')}
          className="font-mono text-xs text-gray-500 hover:text-gray-300 mb-6 block mx-auto"
          whileHover={{ x: -4 }}
        >
          {'\u{2190}'} Back to games
        </motion.button>

        <span className="text-5xl block mb-4">{game.emoji}</span>
        <h1 className="font-pixel text-2xl text-white mb-2">{game.name}</h1>
        <p className="font-mono text-sm text-gray-400">{game.tagline}</p>
      </div>

      {/* Game Rules */}
      <div className="max-w-2xl mx-auto px-6 mb-8">
        <div className="bg-arena-panel border border-arena-border/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-pixel text-[10px] text-arena-accent">HOW IT WORKS</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="font-pixel text-xs text-white block mb-1">
                {game.playerCount.min === game.playerCount.max
                  ? game.playerCount.min
                  : `${game.playerCount.min}-${game.playerCount.max}`}
              </span>
              <span className="font-mono text-[10px] text-gray-500">Players</span>
            </div>
            <div>
              <span className="font-pixel text-xs text-white block mb-1">{game.estimatedDuration}</span>
              <span className="font-mono text-[10px] text-gray-500">Duration</span>
            </div>
            <div>
              <span className="font-pixel text-xs text-white block mb-1">{game.tags.length}</span>
              <span className="font-mono text-[10px] text-gray-500">Mechanics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Debate Topic (only for debate game) */}
      {gameId === 'debate' && (
        <div className="max-w-2xl mx-auto px-6 mb-8">
          <div className="bg-arena-panel border border-arena-border/50 rounded-xl p-5">
            <label className="font-pixel text-[10px] text-arena-accent block mb-3">
              {'\u{1F4AC}'} DEBATE TOPIC
            </label>
            <input
              type="text"
              value={debateTopic}
              onChange={(e) => setDebateTopic(e.target.value)}
              placeholder="Enter a topic or pick one below..."
              className="w-full bg-arena-dark border border-arena-border rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-arena-accent transition-colors mb-3"
            />
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.map(topic => (
                <button
                  key={topic}
                  onClick={() => setDebateTopic(topic)}
                  className={`font-mono text-[10px] px-3 py-1.5 rounded-full border transition-colors ${
                    debateTopic === topic
                      ? 'bg-arena-accent/20 border-arena-accent/50 text-arena-accent'
                      : 'bg-arena-dark border-arena-border/50 text-gray-400 hover:border-arena-accent/30 hover:text-gray-300'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Model Picker */}
      <div className="max-w-3xl mx-auto px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-pixel text-xs text-arena-gold">
            {'\u{1F916}'} CHOOSE YOUR FIGHTERS
          </h2>
          <span className="font-mono text-[10px] text-gray-500">
            {selected.size}/{game.playerCount.max} selected
            {selected.size < game.playerCount.min && (
              <span className="text-arena-red ml-1">(need {game.playerCount.min - selected.size} more)</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence>
            {PLAYER_CONFIGS.map((player) => {
              const isSelected = selected.has(player.id);
              const isDisabled = !isSelected && selected.size >= game!.playerCount.max;

              return (
                <motion.div
                  key={player.id}
                  layout
                  onClick={() => !isDisabled && togglePlayer(player.id)}
                  className={`relative rounded-xl p-4 cursor-pointer border-2 transition-all ${
                    isSelected
                      ? 'bg-arena-dark border-arena-accent/60'
                      : isDisabled
                        ? 'bg-arena-dark/40 border-arena-border/20 opacity-40 cursor-not-allowed'
                        : 'bg-arena-dark border-arena-border/40 hover:border-arena-border'
                  }`}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-arena-accent flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <span className="text-white text-[10px]">{'\u{2713}'}</span>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{player.emoji}</span>
                    <div className="min-w-0">
                      <h3
                        className="font-pixel text-[9px] truncate"
                        style={{ color: isSelected ? player.color : '#9ca3af' }}
                      >
                        {player.nickname}
                      </h3>
                      <p className="font-mono text-[9px] text-gray-600 truncate">
                        {player.name}
                      </p>
                    </div>
                  </div>

                  <p className="font-mono text-[9px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {player.description}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center py-10">
        <motion.button
          onClick={handleStart}
          disabled={!canStart}
          className={`font-pixel text-sm px-10 py-4 rounded-xl text-white relative overflow-hidden ${
            !canStart ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          style={{
            background: canStart
              ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)'
              : '#374151',
            boxShadow: canStart ? '0 0 30px rgba(108, 92, 231, 0.4)' : 'none',
          }}
          whileHover={canStart ? { scale: 1.05 } : {}}
          whileTap={canStart ? { scale: 0.95 } : {}}
        >
          {game.emoji} START {game.name.toUpperCase()}
        </motion.button>
      </div>
    </motion.div>
  );
}
