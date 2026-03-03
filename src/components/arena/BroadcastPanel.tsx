import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../hooks/useGame';

export default function BroadcastPanel() {
  const { broadcasts } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [broadcasts.length]);

  const recent = broadcasts.slice(-30);

  return (
    <div className="bg-arena-panel/80 border border-arena-border rounded-lg p-2.5 flex flex-col h-full">
      <h3 className="font-pixel text-[9px] text-arena-gold mb-2 px-1 shrink-0">CHAT</h3>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 min-h-0">
        <AnimatePresence initial={false}>
          {recent.length === 0 ? (
            <p className="font-mono text-gray-600 italic" style={{ fontSize: 10 }}>Silence...</p>
          ) : (
            recent.map((b, i) => (
              <motion.div
                key={`${b.round}-${b.playerId}-${i}`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-1.5 items-start leading-tight"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-pixel" style={{ fontSize: 7, color: b.playerColor }}>
                    {b.playerNickname.replace('The ', '')}
                  </span>
                  <span className="font-mono text-gray-300 ml-1.5" style={{ fontSize: 10 }}>
                    {b.message}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
