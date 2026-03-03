import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Player } from '../../engine/types';
import { callModelForInterview } from '../../services/novitaApi';

interface PostGameInterviewProps {
  players: Player[];
  winner: Player | null;
  apiKey: string;
}

export default function PostGameInterview({ players, winner, apiKey }: PostGameInterviewProps) {
  const [interviews, setInterviews] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInterviews() {
      const results = new Map<string, string>();

      // Interview all players (winner + eliminated)
      const interviewees = winner
        ? [winner, ...players.filter(p => !p.alive)]
        : players;

      await Promise.all(
        interviewees.slice(0, 4).map(async (player) => {
          const context = player.alive
            ? `You won the battle! You survived ${player.roundsSurvived} rounds with ${player.kills} kills.`
            : `You were eliminated in round ${player.eliminatedRound}${player.eliminatedBy ? ` by ${player.eliminatedBy}` : ''}.`;

          const response = await callModelForInterview(
            player.model,
            player.nickname,
            context,
            apiKey
          );
          results.set(player.id, response);
        })
      );

      setInterviews(results);
      setLoading(false);
    }

    fetchInterviews();
  }, [players, winner, apiKey]);

  const interviewees = winner
    ? [winner, ...players.filter(p => !p.alive)]
    : players;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="font-pixel text-lg text-arena-gold text-center mb-6">
        POST-GAME INTERVIEWS
      </h2>

      {loading && (
        <motion.p
          className="text-center font-mono text-sm text-gray-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Interviewing the fighters...
        </motion.p>
      )}

      <div className="space-y-4">
        {interviewees.slice(0, 4).map((player, i) => {
          const quote = interviews.get(player.id);
          if (!quote) return null;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.3 }}
              className="bg-arena-dark border border-arena-border rounded-xl p-6"
            >
              <p className="font-mono text-sm text-gray-300 italic mb-3">
                "{quote}"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: player.color }} />
                <span className="font-pixel text-xs" style={{ color: player.color }}>
                  -- {player.nickname}
                </span>
                {player.alive && (
                  <span className="font-mono text-xs text-arena-gold ml-2">
                    Champion
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
