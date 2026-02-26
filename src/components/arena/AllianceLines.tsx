import { Player } from '../../engine/types';

interface AllianceLinesProps {
  players: Player[];
  tileSize: number;
}

export default function AllianceLines({ players, tileSize }: AllianceLinesProps) {
  const alive = players.filter(p => p.alive);
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number; color: string }> = [];
  const seen = new Set<string>();

  for (const p of alive) {
    for (const allyNick of p.alliances) {
      const ally = alive.find(a => a.nickname === allyNick);
      if (!ally || !ally.alliances.includes(p.nickname)) continue;
      const key = [p.id, ally.id].sort().join('-');
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push({
        x1: p.position.x * tileSize + tileSize / 2,
        y1: p.position.y * tileSize + tileSize / 2,
        x2: ally.position.x * tileSize + tileSize / 2,
        y2: ally.position.y * tileSize + tileSize / 2,
        color: p.color,
      });
    }
  }

  if (!lines.length) return null;

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 5 }}>
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={l.color} strokeWidth={2} strokeDasharray="5 3" opacity={0.6} />
      ))}
    </svg>
  );
}
