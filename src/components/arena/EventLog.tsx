import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../hooks/useGame';
import { GameEvent } from '../../engine/types';

const TYPE_COLORS: Record<GameEvent['type'], string> = {
  move: '#666',
  attack: '#ef5350',
  gather: '#66bb6a',
  craft: '#ffa726',
  rest: '#42a5f5',
  speak: '#ab47bc',
  ally: '#26a69a',
  betray: '#ff4757',
  elimination: '#ff1744',
  system: '#90a4ae',
  shoot: '#ff7043',
  zone: '#ef5350',
  item: '#ffee58',
  use: '#66bb6a',
};

const TYPE_LABELS: Partial<Record<GameEvent['type'], string>> = {
  attack: 'ATK',
  shoot: 'BOW',
  elimination: 'KILL',
  betray: 'BETRAY',
  ally: 'ALLY',
  gather: 'GATHER',
  craft: 'CRAFT',
  zone: 'ZONE',
  item: 'ITEM',
  rest: 'REST',
  use: 'USE',
};

export default function EventLog() {
  const { events } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [events.length]);

  const filtered = events.filter(e => e.type !== 'move').slice(-50);

  return (
    <div className="bg-arena-panel/80 border border-arena-border rounded-lg p-2.5 flex flex-col h-full">
      <h3 className="font-pixel text-[9px] text-arena-gold mb-2 px-1 shrink-0">LOG</h3>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-0.5 min-h-0">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <p className="font-mono text-gray-600 italic" style={{ fontSize: 10 }}>Waiting...</p>
          ) : (
            filtered.map((ev, i) => (
              <motion.div
                key={`${ev.round}-${ev.playerId}-${ev.type}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="leading-tight font-mono flex items-start gap-1"
                style={{ fontSize: 10, color: TYPE_COLORS[ev.type] || '#888' }}
              >
                <span className="text-gray-500 shrink-0" style={{ fontSize: 9 }}>R{ev.round}</span>
                <span className="shrink-0 font-pixel" style={{ fontSize: 7 }}>{TYPE_LABELS[ev.type] || ''}</span>
                <span>{ev.description}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
