import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../hooks/useGame';

export default function FighterPanel() {
  const { players } = useGame();
  const sorted = [...players].sort((a, b) => {
    if (a.alive && !b.alive) return -1;
    if (!a.alive && b.alive) return 1;
    return b.hp - a.hp;
  });

  return (
    <div className="bg-arena-panel/80 border border-arena-border rounded-lg p-2.5 flex flex-col h-full">
      <h3 className="font-pixel text-[9px] text-arena-gold mb-2 px-1 shrink-0">FIGHTERS</h3>
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        <AnimatePresence>
          {sorted.map(p => (
            <motion.div
              key={p.id} layout
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: p.alive ? 1 : 0.35, x: 0 }}
              className="bg-arena-dark/60 rounded-md px-2.5 py-2 border border-arena-border/40"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: p.alive ? p.color : '#555' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel truncate" style={{ fontSize: 8, color: p.alive ? p.color : '#555' }}>
                      {p.nickname}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {p.kills > 0 && (
                        <span className="font-mono text-arena-red" style={{ fontSize: 8 }}>
                          {p.kills}K
                        </span>
                      )}
                      {p.alive && <span className="font-mono text-[10px] text-gray-400">{p.hp}</span>}
                    </div>
                  </div>
                  {p.alive && (
                    <div className="bg-black/40 rounded-full h-2 mt-1 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        animate={{
                          width: `${(p.hp / p.maxHp) * 100}%`,
                          backgroundColor: p.hp > 60 ? '#4caf50' : p.hp > 30 ? '#ff9800' : '#f44336',
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
              </div>
              {p.alive && p.inventory.length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {p.inventory.map((item, i) => (
                    <span key={i} className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-gray-300" style={{ fontSize: 8 }}>
                      {item}
                    </span>
                  ))}
                </div>
              )}
              {p.alive && p.alliances.length > 0 && (
                <div className="mt-1">
                  <span className="font-mono text-arena-green/70" style={{ fontSize: 8 }}>
                    allies: {p.alliances.join(', ')}
                  </span>
                </div>
              )}
              {!p.alive && (
                <div className="mt-0.5">
                  <span className="font-mono text-gray-600" style={{ fontSize: 8 }}>
                    Eliminated Rd {p.eliminatedRound} {p.eliminatedBy ? `by ${p.eliminatedBy}` : ''}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
