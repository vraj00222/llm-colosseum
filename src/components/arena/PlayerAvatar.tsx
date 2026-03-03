import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../engine/types';

interface PlayerAvatarProps {
  player: Player;
  tileSize: number;
  isAttacking?: boolean;
  isBeingAttacked?: boolean;
}

// Gather.town-style pixel character
function PixelCharacter({ color, emoji, facing, size, shield }: {
  color: string; emoji: string; facing: string; size: number; shield: boolean;
}) {
  const s = size * 0.75;
  const headSize = s * 0.42;
  const bodyW = s * 0.38;
  const bodyH = s * 0.3;
  const legW = s * 0.13;
  const legH = s * 0.18;

  return (
    <div className="pixel-render" style={{ width: s, height: s, position: 'relative' }}>
      {/* Shadow */}
      <div style={{
        position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
        width: s * 0.55, height: s * 0.1,
        background: 'rgba(0,0,0,0.2)', borderRadius: '50%',
      }} />
      {/* Legs */}
      <div style={{
        position: 'absolute', bottom: s * 0.04, left: `calc(50% - ${legW + 1.5}px)`,
        width: legW, height: legH,
        background: darken(color, 40), borderRadius: '2px 2px 3px 3px',
      }} />
      <div style={{
        position: 'absolute', bottom: s * 0.04, left: `calc(50% + 1.5px)`,
        width: legW, height: legH,
        background: darken(color, 35), borderRadius: '2px 2px 3px 3px',
      }} />
      {/* Body */}
      <div style={{
        position: 'absolute', bottom: s * 0.18, left: '50%', transform: 'translateX(-50%)',
        width: bodyW, height: bodyH, background: color, borderRadius: 3,
        boxShadow: `inset -3px -2px 0 ${darken(color, 25)}, inset 2px 1px 0 ${lighten(color, 20)}`,
      }} />
      {/* Arms */}
      <div style={{
        position: 'absolute', bottom: s * 0.22, left: `calc(50% - ${bodyW / 2 + 3}px)`,
        width: s * 0.1, height: bodyH * 0.7,
        background: darken(color, 15), borderRadius: 2,
      }} />
      <div style={{
        position: 'absolute', bottom: s * 0.22, right: `calc(50% - ${bodyW / 2 + 3}px)`,
        width: s * 0.1, height: bodyH * 0.7,
        background: darken(color, 20), borderRadius: 2,
      }} />
      {/* Head */}
      <div style={{
        position: 'absolute', top: s * 0.02, left: '50%', transform: 'translateX(-50%)',
        width: headSize, height: headSize,
        background: '#fcd8b4',
        borderRadius: '42%',
        boxShadow: `inset -2px -2px 0 #e4b896, inset 1px 1px 0 #ffe8d0`,
        overflow: 'hidden',
      }}>
        {/* Hair on top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: headSize * 0.32,
          background: darken(color, 50),
          borderRadius: '42% 42% 0 0',
        }} />
      </div>
      {/* Eyes */}
      <div style={{
        position: 'absolute', top: s * 0.16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: headSize * 0.22,
      }}>
        <div style={{
          width: 2.5, height: 3, background: '#2c2c2c', borderRadius: '50%',
        }} />
        <div style={{
          width: 2.5, height: 3, background: '#2c2c2c', borderRadius: '50%',
        }} />
      </div>
      {/* Shield glow */}
      {shield && (
        <div style={{
          position: 'absolute', inset: -3,
          border: '2px solid rgba(52, 152, 219, 0.5)',
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(52, 152, 219, 0.3)',
        }} />
      )}
      {/* Weapon indicator */}
      {facing === 'east' && (
        <div style={{
          position: 'absolute', right: -4, top: s * 0.32, width: s * 0.14, height: 3,
          background: darken(color, 15), borderRadius: 1,
        }} />
      )}
      {facing === 'west' && (
        <div style={{
          position: 'absolute', left: -4, top: s * 0.32, width: s * 0.14, height: 3,
          background: darken(color, 15), borderRadius: 1,
        }} />
      )}
    </div>
  );
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export default function PlayerAvatar({ player, tileSize, isAttacking, isBeingAttacked }: PlayerAvatarProps) {
  if (!player.alive) return null;

  // Position at tile center using left/top, keeping within grid via overflow:hidden on parent
  const charSize = tileSize * 0.75;

  return (
    <AnimatePresence>
      <motion.div
        key={player.id}
        className="absolute flex flex-col items-center pointer-events-none"
        initial={false}
        animate={{
          left: player.position.x * tileSize + (tileSize - charSize) / 2,
          top: player.position.y * tileSize - 12, // offset up for name tag
          scale: isBeingAttacked ? [1, 1.12, 0.88, 1] : 1,
          x: isAttacking ? [0, -3, 3, -3, 0] : 0,
        }}
        transition={{
          left: { type: 'spring', stiffness: 220, damping: 20 },
          top: { type: 'spring', stiffness: 220, damping: 20 },
          scale: { duration: 0.25 },
        }}
        style={{ zIndex: 10 + player.position.y, width: charSize }}
      >
        {/* Name tag - Gather.town style dark pill */}
        <div
          className="font-pixel text-center whitespace-nowrap px-1.5 py-0.5 rounded-sm mb-0.5"
          style={{
            fontSize: Math.max(5, tileSize * 0.15),
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: player.color,
            textShadow: `0 0 4px ${player.color}66`,
            lineHeight: 1.2,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {player.nickname.replace('The ', '')}
        </div>

        {/* Pixel character */}
        <PixelCharacter
          color={player.color}
          emoji={player.emoji}
          facing={player.facing}
          size={tileSize}
          shield={player.shield}
        />

        {/* HP bar - Gather.town style */}
        <div style={{
          width: charSize * 0.85, height: 4, background: 'rgba(0,0,0,0.5)',
          borderRadius: 2, marginTop: 1, border: '0.5px solid rgba(0,0,0,0.3)',
        }}>
          <motion.div
            style={{ height: '100%', borderRadius: 2 }}
            animate={{
              width: `${(player.hp / player.maxHp) * 100}%`,
              backgroundColor: player.hp > 60 ? '#4caf50' : player.hp > 30 ? '#ff9800' : '#f44336',
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Attack flash */}
        {isBeingAttacked && (
          <motion.div
            className="absolute rounded-full"
            style={{
              top: 12, left: -4, right: -4, bottom: 4,
              background: 'rgba(255,50,50,0.35)',
              borderRadius: '50%',
            }}
            initial={{ opacity: 1, scale: 1.2 }}
            animate={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
