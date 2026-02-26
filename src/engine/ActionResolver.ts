import { ActionType, Player, Tile, GameEvent, Broadcast, Direction, ItemDrop, Projectile } from './types';
import { MAP_SIZE, getZoneDamage } from './MapGenerator';

const DIRECTIONS: Record<Direction, { dx: number; dy: number }> = {
  north: { dx: 0, dy: -1 },
  south: { dx: 0, dy: 1 },
  east: { dx: 1, dy: 0 },
  west: { dx: -1, dy: 0 },
};

export function parseAction(raw: string, player: Player, allPlayers: Player[]): ActionType {
  const cleaned = raw.trim().replace(/^```.*\n?/g, '').replace(/```$/g, '').replace(/\*\*/g, '').trim();
  const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let line = lines[0] || '';

  const actionKeywords = ['MOVE', 'ATTACK', 'SHOOT', 'GATHER', 'CRAFT', 'USE', 'REST', 'SPEAK', 'ALLY', 'BETRAY'];
  if (!actionKeywords.some(k => line.toUpperCase().startsWith(k))) {
    const found = lines.find(l => actionKeywords.some(k => l.toUpperCase().startsWith(k)));
    if (found) line = found;
  }

  const parts = line.split(/\s+/);
  const command = parts[0]?.toUpperCase();
  const aliveNicknames = allPlayers.filter(p => p.alive && p.id !== player.id).map(p => p.nickname);

  switch (command) {
    case 'MOVE': {
      const dir = parts[1]?.toLowerCase() as Direction;
      if (['north', 'south', 'east', 'west'].includes(dir)) return { type: 'MOVE', direction: dir };
      break;
    }
    case 'ATTACK': {
      const target = findTarget(parts.slice(1).join(' '), aliveNicknames);
      if (target) return { type: 'ATTACK', target };
      break;
    }
    case 'SHOOT': {
      const dir = parts[1]?.toLowerCase() as Direction;
      if (['north', 'south', 'east', 'west'].includes(dir)) return { type: 'SHOOT', direction: dir };
      break;
    }
    case 'GATHER': return { type: 'GATHER' };
    case 'CRAFT': {
      const item = parts[1]?.toLowerCase();
      if (['sword', 'potion', 'bow', 'bomb'].includes(item)) return { type: 'CRAFT', item: item as any };
      break;
    }
    case 'USE': {
      const item = parts[1]?.toLowerCase();
      if (item) return { type: 'USE', item };
      break;
    }
    case 'REST': return { type: 'REST' };
    case 'SPEAK': {
      const msg = parts.slice(1).join(' ').slice(0, 50);
      if (msg) return { type: 'SPEAK', message: msg };
      break;
    }
    case 'ALLY': {
      const target = findTarget(parts.slice(1).join(' '), aliveNicknames);
      if (target) return { type: 'ALLY', target };
      break;
    }
    case 'BETRAY': {
      const target = findTarget(parts.slice(1).join(' '), aliveNicknames);
      if (target) return { type: 'BETRAY', target };
      break;
    }
  }
  return getRandomAction(player);
}

function findTarget(raw: string, valid: string[]): string | null {
  const t = raw.trim().replace(/^["']|["']$/g, '');
  return valid.find(n => n.toLowerCase() === t.toLowerCase())
    || valid.find(n => n.toLowerCase().includes(t.toLowerCase()))
    || valid.find(n => t.toLowerCase().includes(n.toLowerCase()))
    || null;
}

function getRandomAction(player: Player): ActionType {
  const dirs: Direction[] = ['north', 'south', 'east', 'west'];
  const ok = dirs.filter(d => {
    const { dx, dy } = DIRECTIONS[d];
    const nx = player.position.x + dx, ny = player.position.y + dy;
    return nx >= 0 && nx < MAP_SIZE && ny >= 0 && ny < MAP_SIZE;
  });
  return { type: 'MOVE', direction: ok[Math.floor(Math.random() * ok.length)] };
}

function isAdjacent(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

function withinRange(a: { x: number; y: number }, b: { x: number; y: number }, range: number): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= range;
}

export interface ResolvedActions {
  players: Player[];
  events: GameEvent[];
  broadcasts: Broadcast[];
  eliminations: Player[];
  itemDrops: ItemDrop[];
  projectiles: Projectile[];
}

function removeItems(inv: string[], items: string[]) {
  for (const item of items) {
    const idx = inv.indexOf(item);
    if (idx !== -1) inv.splice(idx, 1);
  }
}

export function resolveActions(
  players: Player[],
  actions: Map<string, ActionType>,
  map: Tile[][],
  round: number,
  itemDrops: ItemDrop[],
  _existingProjectiles: Projectile[],
  zoneRadius: number
): ResolvedActions {
  const updated = players.map(p => ({
    ...p, inventory: [...p.inventory], alliances: [...p.alliances], stunned: false,
  }));
  const events: GameEvent[] = [];
  const broadcasts: Broadcast[] = [];
  const eliminations: Player[] = [];
  let drops = [...itemDrops];
  const projectiles: Projectile[] = [];
  const ts = Date.now();

  const get = (id: string) => updated.find(p => p.id === id)!;
  const byNick = (n: string) => updated.find(p => p.nickname === n && p.alive);

  // Phase 1: SPEAK
  for (const [pid, action] of actions) {
    const p = get(pid);
    if (!p.alive || p.stunned || action.type !== 'SPEAK') continue;
    p.lastMessage = action.message;
    p.lastAction = `SPEAK: "${action.message}"`;
    broadcasts.push({ round, playerId: pid, playerNickname: p.nickname,
      playerColor: p.color, playerEmoji: p.emoji, message: action.message, timestamp: ts });
  }

  // Phase 2: ALLY / BETRAY
  for (const [pid, action] of actions) {
    const p = get(pid);
    if (!p.alive || p.stunned) continue;

    if (action.type === 'ALLY') {
      const t = byNick(action.target);
      if (t) {
        if (!p.alliances.includes(t.nickname)) p.alliances.push(t.nickname);
        const ta = actions.get(t.id);
        if (ta?.type === 'ALLY' && findTarget((ta as any).target, [p.nickname])) {
          if (!t.alliances.includes(p.nickname)) t.alliances.push(p.nickname);
          events.push({ round, playerId: pid, playerNickname: p.nickname,
            description: `\u{1F91D} ${p.nickname} and ${t.nickname} formed an alliance!`, type: 'ally', timestamp: ts });
        } else {
          events.push({ round, playerId: pid, playerNickname: p.nickname,
            description: `${p.emoji} ${p.nickname} proposes alliance with ${t.nickname}`, type: 'ally', timestamp: ts });
        }
        p.lastAction = `ALLY ${t.nickname}`;
      }
    }

    if (action.type === 'BETRAY') {
      const t = byNick(action.target);
      if (t && withinRange(p.position, t.position, 3)) {
        p.alliances = p.alliances.filter(a => a !== t.nickname);
        t.alliances = t.alliances.filter(a => a !== p.nickname);
        let dmg = 35;
        if (t.shield) { dmg = Math.floor(dmg * 0.4); t.shield = false; }
        t.hp = Math.max(0, t.hp - dmg);
        p.lastAction = `BETRAY ${t.nickname}`;
        events.push({ round, playerId: pid, playerNickname: p.nickname,
          description: `\u{1F5E1}\u{FE0F} ${p.nickname} BETRAYED ${t.nickname}! (${dmg} dmg)`, type: 'betray', timestamp: ts });
        if (t.hp <= 0) {
          t.alive = false; t.eliminatedRound = round; t.eliminatedBy = p.nickname; p.kills++;
          eliminations.push({ ...t });
          events.push({ round, playerId: t.id, playerNickname: t.nickname,
            description: `\u{1F480} ${t.nickname} BACKSTABBED by ${p.nickname}!`, type: 'elimination', timestamp: ts });
        }
      }
    }
  }

  // Phase 3: MOVE + auto-pickup items
  const moveIntents = new Map<string, { x: number; y: number }>();
  for (const [pid, action] of actions) {
    const p = get(pid);
    if (!p.alive || p.stunned || action.type !== 'MOVE') continue;
    const d = DIRECTIONS[action.direction];
    const nx = p.position.x + d.dx, ny = p.position.y + d.dy;
    if (nx < 0 || nx >= MAP_SIZE || ny < 0 || ny >= MAP_SIZE) continue;
    if (map[ny][nx].type === 'water') continue;
    moveIntents.set(pid, { x: nx, y: ny });
    p.facing = action.direction;
  }

  const dests = new Map<string, string[]>();
  for (const [pid, pos] of moveIntents) {
    const k = `${pos.x},${pos.y}`;
    if (!dests.has(k)) dests.set(k, []);
    dests.get(k)!.push(pid);
  }
  for (const [pid, pos] of moveIntents) {
    const k = `${pos.x},${pos.y}`;
    const occ = dests.get(k)!;
    const blocked = updated.some(p => p.alive && p.id !== pid && p.position.x === pos.x && p.position.y === pos.y && !moveIntents.has(p.id));
    if (occ.length > 1 || blocked) continue;
    const p = get(pid);
    p.position = pos;
    p.lastAction = `MOVE ${(actions.get(pid) as any).direction}`;

    // Auto-pickup
    const ii = drops.findIndex(d => d.position.x === pos.x && d.position.y === pos.y);
    if (ii !== -1 && p.inventory.length < 5) {
      const item = drops[ii];
      p.inventory.push(item.type);
      drops = drops.filter((_, i) => i !== ii);
      if (item.type === 'shield') p.shield = true;
      events.push({ round, playerId: pid, playerNickname: p.nickname,
        description: `${p.emoji} ${p.nickname} picked up ${item.type}!`, type: 'item', timestamp: ts });
    }
  }

  // Phase 4: GATHER / CRAFT / REST / USE
  for (const [pid, action] of actions) {
    const p = get(pid);
    if (!p.alive || p.stunned) continue;

    if (action.type === 'GATHER') {
      const tile = map[p.position.y]?.[p.position.x];
      if (tile?.hasResource && p.inventory.length < 5) {
        const resourceMap: Record<string, string> = { tree: 'wood', rock: 'stone', bush: 'berries', water: 'water' };
        const res = resourceMap[tile.type];
        if (res) {
          p.inventory.push(res);
          p.lastAction = `GATHER ${res}`;
          events.push({ round, playerId: pid, playerNickname: p.nickname,
            description: `${p.emoji} ${p.nickname} gathered ${res}`, type: 'gather', timestamp: ts });
        }
      }
    }

    if (action.type === 'CRAFT') {
      const inv = p.inventory;
      const recipes: Record<string, [string[], string]> = {
        sword: [['wood', 'stone'], '\u{2694}\u{FE0F}'],
        bow: [['wood', 'wood'], '\u{1F3F9}'],
        potion: [['berries', 'water'], '\u{1F9EA}'],
        bomb: [['stone', 'stone'], '\u{1F4A3}'],
      };
      const recipe = recipes[action.item];
      if (recipe && recipe[0].every(r => inv.includes(r))) {
        removeItems(inv, recipe[0]);
        inv.push(action.item);
        p.lastAction = `CRAFT ${action.item}`;
        events.push({ round, playerId: pid, playerNickname: p.nickname,
          description: `${recipe[1]} ${p.nickname} crafted a ${action.item}!`, type: 'craft', timestamp: ts });
      }
    }

    if (action.type === 'USE') {
      if (action.item === 'potion' && p.inventory.includes('potion')) {
        removeItems(p.inventory, ['potion']);
        p.hp = Math.min(p.maxHp, p.hp + 35);
        p.lastAction = 'USE potion';
        events.push({ round, playerId: pid, playerNickname: p.nickname,
          description: `\u{2764}\u{FE0F} ${p.nickname} drank a potion! (+35 HP)`, type: 'use', timestamp: ts });
      }
      if (action.item === 'bomb' && p.inventory.includes('bomb')) {
        removeItems(p.inventory, ['bomb']);
        p.lastAction = 'USE bomb';
        for (const t of updated) {
          if (!t.alive || t.id === pid) continue;
          if (withinRange(p.position, t.position, 2)) {
            let dmg = 22;
            if (t.shield) { dmg = Math.floor(dmg * 0.4); t.shield = false; }
            t.hp = Math.max(0, t.hp - dmg);
            t.stunned = true;
            events.push({ round, playerId: pid, playerNickname: p.nickname,
              description: `\u{1F4A5} ${p.nickname}'s bomb hit ${t.nickname}! (${dmg} dmg + stun)`, type: 'attack', timestamp: ts });
          }
        }
      }
    }

    if (action.type === 'REST') {
      const enemy = updated.some(t => t.alive && t.id !== pid && !p.alliances.includes(t.nickname) && isAdjacent(p.position, t.position));
      if (!enemy) {
        p.hp = Math.min(p.maxHp, p.hp + 10);
        p.lastAction = 'REST';
        events.push({ round, playerId: pid, playerNickname: p.nickname,
          description: `\u{1F4A4} ${p.nickname} rested (+10 HP)`, type: 'rest', timestamp: ts });
      }
    }
  }

  // Phase 5: SHOOT
  for (const [pid, action] of actions) {
    const p = get(pid);
    if (!p.alive || p.stunned || action.type !== 'SHOOT') continue;
    if (!p.inventory.includes('bow')) { p.lastAction = 'SHOOT (no bow!)'; continue; }
    p.facing = action.direction;
    const d = DIRECTIONS[action.direction];
    let baseDmg = 18 + (p.inventory.includes('sword') ? 5 : 0);
    let hit = false;
    let pos = { ...p.position };
    for (let i = 0; i < 4; i++) {
      pos = { x: pos.x + d.dx, y: pos.y + d.dy };
      if (pos.x < 0 || pos.x >= MAP_SIZE || pos.y < 0 || pos.y >= MAP_SIZE) break;
      const tile = map[pos.y][pos.x];
      if (tile.type === 'rock' || tile.type === 'tree') break;
      const target = updated.find(t => t.alive && t.position.x === pos.x && t.position.y === pos.y);
      if (target) {
        let dmg = baseDmg;
        if (p.alliances.includes(target.nickname)) dmg = Math.floor(dmg * 0.5);
        if (target.shield) { dmg = Math.floor(dmg * 0.4); target.shield = false; }
        target.hp = Math.max(0, target.hp - dmg);
        hit = true;
        events.push({ round, playerId: pid, playerNickname: p.nickname,
          description: `\u{1F3F9} ${p.nickname} shot ${target.nickname}! (${dmg} dmg)`, type: 'shoot', timestamp: ts });
        p.lastAction = `SHOOT ${target.nickname}`;
        break;
      }
    }
    if (!hit) p.lastAction = `SHOOT ${action.direction} (missed)`;
  }

  // Phase 6: ATTACK (melee)
  for (const [pid, action] of actions) {
    const p = get(pid);
    if (!p.alive || p.stunned || action.type !== 'ATTACK') continue;
    const t = byNick(action.target);
    if (!t || !isAdjacent(p.position, t.position)) { p.lastAction = `ATTACK (missed)`; continue; }
    let dmg = 18 + Math.floor(Math.random() * 10);
    if (p.inventory.includes('sword')) dmg += 12;
    if (p.alliances.includes(t.nickname)) dmg = Math.floor(dmg * 0.5);
    if (t.shield) { dmg = Math.floor(dmg * 0.4); t.shield = false; }
    t.hp = Math.max(0, t.hp - dmg);
    p.lastAction = `ATTACK ${t.nickname} (${dmg} dmg)`;
    events.push({ round, playerId: pid, playerNickname: p.nickname,
      description: `\u{2694}\u{FE0F} ${p.nickname} attacked ${t.nickname} for ${dmg} damage!`, type: 'attack', timestamp: ts });
  }

  // Phase 7: Zone damage
  for (const p of updated) {
    if (!p.alive) continue;
    const dmg = getZoneDamage(p.position, zoneRadius);
    if (dmg > 0) {
      p.hp = Math.max(0, p.hp - dmg);
      events.push({ round, playerId: p.id, playerNickname: p.nickname,
        description: `\u{1F525} ${p.nickname} takes ${dmg} zone damage!`, type: 'zone', timestamp: ts });
    }
  }

  // Phase 8: Eliminations
  for (const p of updated) {
    if (p.hp <= 0 && p.alive) {
      p.alive = false;
      p.eliminatedRound = round;
      if (!p.eliminatedBy) {
        const killer = updated.find(k => {
          const a = actions.get(k.id);
          return a && ['ATTACK', 'SHOOT'].includes(a.type) && 'target' in a && (a as any).target === p.nickname;
        });
        p.eliminatedBy = killer ? killer.nickname : 'the zone';
        if (killer) killer.kills++;
      }
      if (!eliminations.find(e => e.id === p.id)) {
        eliminations.push({ ...p });
        events.push({ round, playerId: p.id, playerNickname: p.nickname,
          description: `\u{1F480} ${p.nickname} eliminated! (by ${p.eliminatedBy})`, type: 'elimination', timestamp: ts });
      }
    }
    if (p.alive) p.roundsSurvived = round;
  }

  return { players: updated, events, broadcasts, eliminations, itemDrops: drops, projectiles };
}
