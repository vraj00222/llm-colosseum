import { memo } from 'react';
import { TileType } from '../../engine/types';

// Gather.town-inspired warm palette
const GRASS_COLORS = [
  ['#7ec850', '#6db842'],  // bright green
  ['#72b848', '#62a83c'],  // medium green
  ['#68ae3e', '#5a9e36'],  // darker green
];

interface TileProps {
  type: TileType;
  size: number;
  x: number;
  y: number;
  inDangerZone?: boolean;
}

// Deterministic pseudo-random from coords
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

function TileComponent({ type, size, x, y, inDangerZone }: TileProps) {
  const isAlt = (x + y) % 2 === 0;
  const h = hash(x, y);
  const h2 = hash(x + 100, y + 100);

  // Base grass color with subtle variation
  const grassIdx = Math.floor(h * GRASS_COLORS.length);
  const [g1, g2] = GRASS_COLORS[grassIdx];
  const grassBg = isAlt ? g1 : g2;

  // For tree/bush tiles, show grass underneath
  const showGrass = type === 'tree' || type === 'bush' || type === 'rock';
  const bg = showGrass ? grassBg : (
    type === 'grass' ? grassBg :
    type === 'water' ? (isAlt ? '#4a9ede' : '#3d8fd4') :
    type === 'lava' ? (isAlt ? '#e74c3c' : '#d63c2c') :
    grassBg
  );

  // Small decorations on grass tiles
  const hasFlower = type === 'grass' && h > 0.88;
  const hasTuft = type === 'grass' && h > 0.72 && h <= 0.88;
  const hasPebble = type === 'grass' && h > 0.65 && h <= 0.72;

  const flowerColors = ['#f5e642', '#e8a0bf', '#fff', '#a8d8f0'];
  const flowerColor = flowerColors[Math.floor(h2 * flowerColors.length)];

  return (
    <div
      className="absolute pixel-render"
      style={{
        left: x * size, top: y * size, width: size, height: size,
        backgroundColor: bg,
      }}
    >
      {/* Subtle grid lines */}
      <div className="absolute inset-0" style={{
        borderRight: '1px solid rgba(0,0,0,0.06)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }} />

      {/* Grass decorations */}
      {hasFlower && (
        <>
          <div style={{
            position: 'absolute',
            left: size * (0.3 + h2 * 0.4), top: size * (0.3 + h * 0.3),
            width: 5, height: 5,
            background: flowerColor,
            borderRadius: '50%',
            boxShadow: `0 0 2px ${flowerColor}`,
          }} />
          <div style={{
            position: 'absolute',
            left: size * (0.3 + h2 * 0.4) - 1, top: size * (0.3 + h * 0.3) + 4,
            width: 2, height: 4,
            background: '#3a8a2e',
            borderRadius: 1,
          }} />
        </>
      )}
      {hasTuft && (
        <div style={{
          position: 'absolute',
          left: size * (0.2 + h2 * 0.5), top: size * (0.4 + h2 * 0.3),
          width: 6, height: 4,
          borderLeft: '2px solid #5a9e3a',
          borderRight: '2px solid #5a9e3a',
          borderTop: '2px solid #5a9e3a',
          borderBottom: 'none',
          borderRadius: '40% 40% 0 0',
          opacity: 0.7,
        }} />
      )}
      {hasPebble && (
        <div style={{
          position: 'absolute',
          left: size * (0.3 + h2 * 0.4), top: size * (0.5 + h2 * 0.2),
          width: 3, height: 2,
          background: '#999',
          borderRadius: '50%',
          opacity: 0.4,
        }} />
      )}

      {/* Tree - Gather.town style with layered canopy */}
      {type === 'tree' && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
          {/* Shadow on ground */}
          <div style={{
            position: 'absolute', bottom: size * 0.08, left: '50%', transform: 'translateX(-50%)',
            width: size * 0.7, height: size * 0.18,
            background: 'rgba(0,0,0,0.15)', borderRadius: '50%',
          }} />
          {/* Trunk */}
          <div style={{
            position: 'absolute', bottom: size * 0.12, left: '50%', transform: 'translateX(-50%)',
            width: size * 0.15, height: size * 0.3,
            background: 'linear-gradient(90deg, #6b4226, #8b5e3c, #6b4226)',
            borderRadius: '2px 2px 3px 3px',
          }} />
          {/* Canopy layer 1 (bottom, widest) */}
          <div style={{
            position: 'absolute', top: size * 0.18, left: '50%', transform: 'translateX(-50%)',
            width: size * 0.75, height: size * 0.42,
            background: 'radial-gradient(ellipse at 40% 50%, #4cb050, #38913e)',
            borderRadius: '45% 50% 45% 50%',
            boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.12), inset 2px 2px 0 rgba(255,255,255,0.08)',
          }} />
          {/* Canopy layer 2 (top highlight) */}
          <div style={{
            position: 'absolute', top: size * 0.06, left: '50%', transform: 'translateX(-52%)',
            width: size * 0.55, height: size * 0.35,
            background: 'radial-gradient(ellipse at 35% 40%, #5cc860, #44a84a)',
            borderRadius: '50% 45% 40% 50%',
          }} />
          {/* Highlight dots on canopy */}
          {h > 0.4 && (
            <div style={{
              position: 'absolute', top: size * 0.15, left: size * 0.35,
              width: 3, height: 3, background: '#6ee070', borderRadius: '50%', opacity: 0.6,
            }} />
          )}
        </div>
      )}

      {/* Water - animated ripples look */}
      {type === 'water' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Depth variation */}
          <div style={{
            position: 'absolute', inset: 0,
            background: isAlt
              ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)'
              : 'linear-gradient(225deg, rgba(255,255,255,0.05) 0%, transparent 50%)',
          }} />
          {/* Wave lines */}
          <div style={{
            position: 'absolute', top: size * 0.25, left: size * 0.05,
            width: size * 0.5, height: 2,
            background: 'rgba(255,255,255,0.2)', borderRadius: 3,
          }} />
          <div style={{
            position: 'absolute', top: size * 0.55, left: size * 0.3,
            width: size * 0.45, height: 2,
            background: 'rgba(255,255,255,0.15)', borderRadius: 3,
          }} />
          {h > 0.6 && (
            <div style={{
              position: 'absolute', top: size * 0.75, left: size * 0.15,
              width: size * 0.3, height: 1.5,
              background: 'rgba(255,255,255,0.12)', borderRadius: 3,
            }} />
          )}
          {/* Shore edge hints */}
          <div style={{
            position: 'absolute', inset: 0,
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 1,
          }} />
        </div>
      )}

      {/* Rock - detailed multi-stone formation */}
      {type === 'rock' && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
          {/* Shadow */}
          <div style={{
            position: 'absolute', bottom: size * 0.1, left: '50%', transform: 'translateX(-50%)',
            width: size * 0.65, height: size * 0.14,
            background: 'rgba(0,0,0,0.15)', borderRadius: '50%',
          }} />
          {/* Main rock */}
          <div style={{
            position: 'absolute', bottom: size * 0.15, left: '50%', transform: 'translateX(-50%)',
            width: size * 0.55, height: size * 0.42,
            background: 'linear-gradient(135deg, #b8b8b8 0%, #8a8a8a 40%, #6a6a6a 100%)',
            borderRadius: '35% 40% 30% 35%',
            boxShadow: 'inset -2px -3px 0 rgba(0,0,0,0.2), inset 2px 2px 0 rgba(255,255,255,0.15)',
          }} />
          {/* Small rock beside */}
          {h > 0.3 && (
            <div style={{
              position: 'absolute', bottom: size * 0.14, left: size * (h > 0.6 ? 0.62 : 0.12),
              width: size * 0.22, height: size * 0.2,
              background: 'linear-gradient(135deg, #a0a0a0, #707070)',
              borderRadius: '40% 35% 35% 40%',
              boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.2)',
            }} />
          )}
          {/* Highlight crack on main rock */}
          <div style={{
            position: 'absolute', bottom: size * 0.32, left: '48%',
            width: size * 0.15, height: 1,
            background: 'rgba(255,255,255,0.15)', transform: 'rotate(-20deg)',
          }} />
        </div>
      )}

      {/* Bush - Gather.town style leafy bush */}
      {type === 'bush' && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
          {/* Shadow */}
          <div style={{
            position: 'absolute', bottom: size * 0.1, left: '50%', transform: 'translateX(-50%)',
            width: size * 0.65, height: size * 0.12,
            background: 'rgba(0,0,0,0.12)', borderRadius: '50%',
          }} />
          {/* Main bush body */}
          <div style={{
            position: 'absolute', bottom: size * 0.12, left: '50%', transform: 'translateX(-50%)',
            width: size * 0.65, height: size * 0.45,
            background: 'radial-gradient(ellipse at 40% 40%, #4caf50, #2e8b40)',
            borderRadius: '50% 45% 50% 45%',
            boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.15), inset 2px 1px 0 rgba(255,255,255,0.08)',
          }} />
          {/* Leaf cluster highlights */}
          <div style={{
            position: 'absolute', bottom: size * 0.35, left: size * 0.28,
            width: size * 0.2, height: size * 0.18,
            background: 'radial-gradient(ellipse, #5cc060, transparent)',
            borderRadius: '50%', opacity: 0.7,
          }} />
          {/* Berry/dot accents */}
          {h > 0.5 && (
            <>
              <div style={{
                position: 'absolute', bottom: size * 0.3, left: size * 0.38,
                width: 3, height: 3, background: '#c0392b', borderRadius: '50%',
              }} />
              <div style={{
                position: 'absolute', bottom: size * 0.38, left: size * 0.55,
                width: 2.5, height: 2.5, background: '#e74c3c', borderRadius: '50%',
              }} />
            </>
          )}
        </div>
      )}

      {/* Danger zone — dark red-black hue */}
      {inDangerZone && (
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(30, 5, 5, 0.65), rgba(60, 10, 10, 0.55))',
          boxShadow: 'inset 0 0 10px rgba(150, 20, 20, 0.4)',
        }} />
      )}
    </div>
  );
}

export default memo(TileComponent);
