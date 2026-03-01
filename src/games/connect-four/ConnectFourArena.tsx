import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../hooks/useGame';
import { ConnectFourState, ROWS, COLS } from './types';

const CELL_SIZE = 72;
const GAP = 4;

export default function ConnectFourArena() {
  const { gameState } = useGame();
  const state = gameState as ConnectFourState;
  if (!state?.board) return null;

  const boardWidth = COLS * (CELL_SIZE + GAP) + GAP;
  const boardHeight = ROWS * (CELL_SIZE + GAP) + GAP;
  const currentPlayer = state.players[state.currentTurn];

  return (
    <div className="flex-1 flex overflow-hidden p-4 gap-4">
      {/* Left: Board */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* Turn indicator */}
          <div className="flex items-center gap-3">
            {state.phase === 'playing' ? (
              <motion.div
                className="flex items-center gap-2 bg-arena-panel/80 px-4 py-2 rounded-lg border border-arena-border/40"
                key={state.currentTurn}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="text-lg">{currentPlayer.emoji}</span>
                <span className="font-pixel text-[10px]" style={{ color: currentPlayer.color }}>
                  {currentPlayer.nickname}'s TURN
                </span>
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentPlayer.color }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            ) : state.winner ? (
              <motion.div
                className="flex items-center gap-2 bg-arena-panel/80 px-4 py-2 rounded-lg border border-arena-gold/40"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <span className="text-lg">{state.winner.emoji}</span>
                <span className="font-pixel text-[10px] text-arena-gold">
                  {state.winner.nickname} WINS!
                </span>
              </motion.div>
            ) : (
              <div className="font-pixel text-[10px] text-gray-400">DRAW</div>
            )}
          </div>

          {/* Column numbers */}
          <div className="flex" style={{ width: boardWidth }}>
            {Array.from({ length: COLS }).map((_, c) => (
              <div
                key={c}
                className="text-center font-pixel text-[9px] text-gray-500"
                style={{ width: CELL_SIZE + GAP }}
              >
                {c + 1}
              </div>
            ))}
          </div>

          {/* Board */}
          <div
            className="rounded-xl relative"
            style={{
              width: boardWidth,
              height: boardHeight,
              background: 'linear-gradient(180deg, #1a3a6e, #0f2854)',
              border: '3px solid #2a4a8e',
              padding: GAP,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 2px 8px rgba(255,255,255,0.05)',
            }}
          >
            {state.board.map((row, r) =>
              row.map((cell, c) => {
                const isWinning = state.winningCells?.some(w => w.row === r && w.col === c);
                const isLastMove = state.lastMove?.row === r && state.lastMove?.col === c;

                return (
                  <div
                    key={`${r}-${c}`}
                    className="absolute rounded-full"
                    style={{
                      left: GAP + c * (CELL_SIZE + GAP),
                      top: GAP + r * (CELL_SIZE + GAP),
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      background: 'radial-gradient(circle at 35% 35%, #0a1e3d, #061228)',
                      boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.6)',
                    }}
                  >
                    <AnimatePresence>
                      {cell !== 0 && (
                        <motion.div
                          className="absolute inset-1 rounded-full"
                          initial={isLastMove ? { y: -(r + 1) * (CELL_SIZE + GAP), scale: 0.9 } : { scale: 1 }}
                          animate={{
                            y: 0,
                            scale: isWinning ? [1, 1.1, 1] : 1,
                          }}
                          transition={
                            isLastMove
                              ? { type: 'spring', stiffness: 300, damping: 20 }
                              : isWinning
                                ? { duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }
                                : { duration: 0 }
                          }
                          style={{
                            background: cell === 1
                              ? `radial-gradient(circle at 35% 35%, ${state.players[0].color}ee, ${state.players[0].color}88)`
                              : `radial-gradient(circle at 35% 35%, ${state.players[1].color}ee, ${state.players[1].color}88)`,
                            boxShadow: isWinning
                              ? `0 0 20px ${cell === 1 ? state.players[0].color : state.players[1].color}80`
                              : `inset 0 -3px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)`,
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right: Player info + move history */}
      <div className="w-[280px] flex flex-col gap-3 overflow-hidden">
        {/* Players */}
        {state.players.map((player, i) => (
          <div
            key={player.id}
            className={`bg-arena-panel/60 rounded-lg border p-4 ${
              state.phase === 'playing' && state.currentTurn === i
                ? 'border-arena-accent/50'
                : 'border-arena-border/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{player.emoji}</span>
              <div>
                <h3 className="font-pixel text-[10px]" style={{ color: player.color }}>
                  {player.nickname}
                </h3>
                <p className="font-mono text-[9px] text-gray-500">
                  {player.name} · {i === 0 ? 'Player 1' : 'Player 2'}
                </p>
              </div>
              <div
                className="ml-auto w-6 h-6 rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${player.color}ee, ${player.color}88)`,
                  boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.3)`,
                }}
              />
            </div>
          </div>
        ))}

        {/* Move history */}
        <div className="flex-1 bg-arena-panel/40 rounded-lg border border-arena-border/20 p-3 overflow-hidden flex flex-col">
          <h3 className="font-pixel text-[9px] text-gray-500 mb-2">MOVE HISTORY</h3>
          <div className="flex-1 overflow-y-auto space-y-1">
            {state.moveHistory.map((move, i) => {
              const p = state.players[move.player - 1];
              return (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 font-mono text-[10px]"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="text-gray-600 w-5">{i + 1}.</span>
                  <span>{p.emoji}</span>
                  <span style={{ color: p.color }}>{p.nickname}</span>
                  <span className="text-gray-500">col {move.col + 1}</span>
                </motion.div>
              );
            })}
            {state.moveHistory.length === 0 && (
              <p className="font-mono text-[10px] text-gray-600 italic">Waiting for first move...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
