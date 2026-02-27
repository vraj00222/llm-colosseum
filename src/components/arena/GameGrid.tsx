import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../hooks/useGame';
import { isInSafeZone, MAP_SIZE } from '../../engine/MapGenerator';
import Tile from './Tile';
import PlayerAvatar from './PlayerAvatar';
import AllianceLines from './AllianceLines';

const TILE_SIZE = 42;

export default function GameGrid() {
  const { map, players, events, round, itemDrops, zoneRadius } = useGame();

  const attackInfo = useMemo(() => {
    const attacking = new Set<string>();
    const beingAttacked = new Set<string>();
    const re = events.filter(e => e.round === round);
    for (const ev of re) {
      if (ev.type === 'attack' || ev.type === 'shoot' || ev.type === 'betray') {
        attacking.add(ev.playerId);
        const m = ev.description.match(/(?:attacked|shot|BETRAYED|bomb hit)\s+(.+?)[\s!]/);
        if (m) {
          const t = players.find(p => p.nickname === m[1]);
          if (t) beingAttacked.add(t.id);
        }
      }
    }
    return { attacking, beingAttacked };
  }, [events, round, players]);

  const gridSize = MAP_SIZE * TILE_SIZE;

  return (
    <div
      className="relative rounded-lg flex-shrink-0"
      style={{
        width: gridSize, height: gridSize,
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.2)',
        border: '3px solid #2a3a1e',
        borderRadius: 8,
      }}
    >
      {/* Tiles */}
      {map.map((row, y) =>
        row.map((tile, x) => (
          <Tile
            key={`${x}-${y}`}
            type={tile.type}
            size={TILE_SIZE}
            x={x} y={y}
            inDangerZone={!isInSafeZone({ x, y }, zoneRadius)}
          />
        ))
      )}

      {/* Item drops */}
      {itemDrops.map(item => (
        <motion.div
          key={item.id}
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            left: item.position.x * TILE_SIZE, top: item.position.y * TILE_SIZE,
            width: TILE_SIZE, height: TILE_SIZE, zIndex: 5,
          }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div style={{
            width: TILE_SIZE * 0.5, height: TILE_SIZE * 0.5,
            background: itemColor(item.type),
            borderRadius: item.type === 'potion' ? '30% 30% 50% 50%' : '22%',
            border: `1.5px solid ${itemBorder(item.type)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: TILE_SIZE * 0.3,
            boxShadow: `0 0 8px ${itemColor(item.type)}66, 0 2px 4px rgba(0,0,0,0.3)`,
          }}>
            {itemEmoji(item.type)}
          </div>
        </motion.div>
      ))}

      {/* Alliance lines */}
      <AllianceLines players={players} tileSize={TILE_SIZE} />

      {/* Players — clipped inside grid */}
      {players.filter(p => p.alive).map(player => (
        <PlayerAvatar
          key={player.id}
          player={player}
          tileSize={TILE_SIZE}
          isAttacking={attackInfo.attacking.has(player.id)}
          isBeingAttacked={attackInfo.beingAttacked.has(player.id)}
        />
      ))}

      {/* Dead player skulls */}
      {players.filter(p => !p.alive && p.eliminatedRound === round).map(p => (
        <motion.div
          key={`dead-${p.id}`}
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            left: p.position.x * TILE_SIZE, top: p.position.y * TILE_SIZE,
            width: TILE_SIZE, height: TILE_SIZE, fontSize: TILE_SIZE * 0.5,
            zIndex: 20,
          }}
          initial={{ scale: 2, opacity: 1 }}
          animate={{ scale: 1, opacity: 0, y: -20 }}
          transition={{ duration: 2 }}
        >
          {'\u{1F480}'}
        </motion.div>
      ))}

      {/* Zone boundary — glowing safe zone border with pulse */}
      {(() => {
        const center = Math.floor(MAP_SIZE / 2);
        const left = (center - zoneRadius) * TILE_SIZE;
        const top = (center - zoneRadius) * TILE_SIZE;
        const size = (zoneRadius * 2 + 1) * TILE_SIZE;
        return (
          <div
            className="absolute pointer-events-none"
            style={{
              left, top, width: size, height: size,
              border: '2px solid rgba(100, 200, 255, 0.5)',
              borderRadius: 4,
              zIndex: 30,
              boxShadow: '0 0 12px rgba(100, 200, 255, 0.3), inset 0 0 12px rgba(100, 200, 255, 0.08)',
              animation: 'zone-border-pulse 3s ease-in-out infinite',
            }}
          />
        );
      })()}
    </div>
  );
}

function itemEmoji(type: string): string {
  const m: Record<string, string> = {
    sword: '\u{2694}\u{FE0F}', bow: '\u{1F3F9}', shield: '\u{1F6E1}\u{FE0F}',
    potion: '\u{1F9EA}', bomb: '\u{1F4A3}',
  };
  return m[type] || '?';
}

function itemColor(type: string): string {
  const m: Record<string, string> = {
    sword: '#d4d4d4', bow: '#a0693e', shield: '#5dade2', potion: '#e74c8b', bomb: '#444',
  };
  return m[type] || '#888';
}

function itemBorder(type: string): string {
  const m: Record<string, string> = {
    sword: '#aaa', bow: '#7a5230', shield: '#3498db', potion: '#c0387a', bomb: '#666',
  };
  return m[type] || '#666';
}
