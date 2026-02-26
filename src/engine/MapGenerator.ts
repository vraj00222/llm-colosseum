import { Tile, Position, ItemDrop } from './types';

export const MAP_SIZE = 15;
const CENTER = Math.floor(MAP_SIZE / 2);

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function generateMap(seed?: number): Tile[][] {
  const rand = seededRandom(seed ?? Date.now());
  const map: Tile[][] = [];

  for (let y = 0; y < MAP_SIZE; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_SIZE; x++) {
      map[y][x] = { type: 'grass', position: { x, y }, hasResource: false };
    }
  }

  // River through map
  let riverX = Math.floor(rand() * 5) + 5;
  for (let y = 0; y < MAP_SIZE; y++) {
    map[y][riverX] = { type: 'water', position: { x: riverX, y }, hasResource: true };
    if (riverX + 1 < MAP_SIZE && rand() > 0.6) {
      map[y][riverX + 1] = { type: 'water', position: { x: riverX + 1, y }, hasResource: true };
    }
    const drift = rand();
    if (drift < 0.3 && riverX > 1) riverX--;
    else if (drift > 0.7 && riverX < MAP_SIZE - 2) riverX++;
  }

  // Tree clusters (smaller, tighter)
  for (let c = 0; c < 5; c++) {
    const cx = Math.floor(rand() * MAP_SIZE);
    const cy = Math.floor(rand() * MAP_SIZE);
    const size = 1 + Math.floor(rand() * 2);
    for (let dy = -size; dy <= size; dy++) {
      for (let dx = -size; dx <= size; dx++) {
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 0 && nx < MAP_SIZE && ny >= 0 && ny < MAP_SIZE) {
          if (Math.abs(dx) + Math.abs(dy) <= size && rand() > 0.3 && map[ny][nx].type === 'grass') {
            map[ny][nx] = { type: 'tree', position: { x: nx, y: ny }, hasResource: true };
          }
        }
      }
    }
  }

  // Rock formations
  for (let c = 0; c < 4; c++) {
    const cx = Math.floor(rand() * MAP_SIZE);
    const cy = Math.floor(rand() * MAP_SIZE);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 0 && nx < MAP_SIZE && ny >= 0 && ny < MAP_SIZE) {
          if (rand() > 0.5 && map[ny][nx].type === 'grass') {
            map[ny][nx] = { type: 'rock', position: { x: nx, y: ny }, hasResource: true };
          }
        }
      }
    }
  }

  // Scattered bushes
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      if (map[y][x].type === 'grass' && rand() > 0.9) {
        map[y][x] = { type: 'bush', position: { x, y }, hasResource: true };
      }
    }
  }

  return map;
}

export function spawnPlayers(map: Tile[][], count: number): Position[] {
  const valid: Position[] = [];
  for (let y = 0; y < MAP_SIZE; y++)
    for (let x = 0; x < MAP_SIZE; x++)
      if (map[y][x].type === 'grass') valid.push({ x, y });

  const positions: Position[] = [];
  for (let i = 0; i < count; i++) {
    let best = valid[Math.floor(Math.random() * valid.length)];
    for (let a = 0; a < 100; a++) {
      const c = valid[Math.floor(Math.random() * valid.length)];
      if (!positions.some(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y) < 4)) {
        best = c;
        break;
      }
    }
    positions.push(best);
  }
  return positions;
}

// Generate random item drops on the map
export function generateItemDrops(map: Tile[][], count: number): ItemDrop[] {
  const items: ItemDrop[] = [];
  const types: ItemDrop['type'][] = ['sword', 'bow', 'shield', 'potion', 'bomb'];
  const valid: Position[] = [];
  for (let y = 0; y < MAP_SIZE; y++)
    for (let x = 0; x < MAP_SIZE; x++)
      if (map[y][x].type === 'grass') valid.push({ x, y });

  for (let i = 0; i < count; i++) {
    const pos = valid[Math.floor(Math.random() * valid.length)];
    items.push({
      id: `item-${i}-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)],
      position: { ...pos },
    });
  }
  return items;
}

// Check if position is inside the safe zone
export function isInSafeZone(pos: Position, zoneRadius: number): boolean {
  const dx = pos.x - CENTER;
  const dy = pos.y - CENTER;
  return Math.max(Math.abs(dx), Math.abs(dy)) <= zoneRadius;
}

// Get zone damage for being outside
export function getZoneDamage(pos: Position, zoneRadius: number): number {
  if (isInSafeZone(pos, zoneRadius)) return 0;
  const dx = Math.abs(pos.x - CENTER);
  const dy = Math.abs(pos.y - CENTER);
  const dist = Math.max(dx, dy) - zoneRadius;
  return Math.min(dist * 5, 15); // 5-15 damage per round outside zone
}
