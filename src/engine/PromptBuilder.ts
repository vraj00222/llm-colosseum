import { Player, Tile, GameEvent, Broadcast, Position, ItemDrop } from './types';
import { MAP_SIZE } from './MapGenerator';

function dist(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function describeNearby(player: Player, allPlayers: Player[], map: Tile[][], itemDrops: ItemDrop[]): string {
  const lines: string[] = [];
  const nearby = allPlayers.filter(
    p => p.id !== player.id && p.alive && dist(player.position, p.position) <= 4
  );

  for (const p of nearby) {
    const tile = map[p.position.y]?.[p.position.x];
    if (tile?.type === 'bush' && dist(player.position, p.position) > 1) continue;
    const d = dist(player.position, p.position);
    const adj = d === 1 ? ' [ADJACENT - CAN ATTACK]' : '';
    const allyTag = player.alliances.includes(p.nickname) ? ' [YOUR ALLY]' : '';
    const weapons = p.inventory.filter(i => ['sword', 'bow', 'bomb', 'shield'].includes(i));
    const weaponStr = weapons.length > 0 ? ` [has: ${weapons.join(',')}]` : '';
    lines.push(`  ${p.emoji} ${p.nickname} (HP:${p.hp}) at (${p.position.x},${p.position.y}) ${d} tiles${adj}${allyTag}${weaponStr}`);
  }

  // Nearby items
  const nearItems = itemDrops.filter(i => dist(player.position, i.position) <= 3);
  const itemLines = nearItems.map(i => `  ${i.type} at (${i.position.x},${i.position.y})`);

  const currentTile = map[player.position.y]?.[player.position.x];
  let result = lines.length > 0 ? 'Players:\n' + lines.join('\n') : 'No players nearby.';
  result += `\nStanding on: ${currentTile?.type ?? 'grass'}`;
  if (itemLines.length > 0) result += '\nItems nearby:\n' + itemLines.join('\n');
  return result;
}

export function buildPrompt(
  player: Player,
  allPlayers: Player[],
  map: Tile[][],
  events: GameEvent[],
  broadcasts: Broadcast[],
  round: number,
  itemDrops: ItemDrop[],
  zoneRadius: number
): { system: string; user: string } {
  const alive = allPlayers.filter(p => p.alive && p.id !== player.id);
  const aliveCount = alive.length + 1;
  const nearbyDesc = describeNearby(player, allPlayers, map, itemDrops);

  const recentEvents = events
    .filter(e => e.round >= round - 2 && e.type !== 'move' && e.type !== 'system')
    .slice(-10)
    .map(e => `  Rd${e.round}: ${e.description}`)
    .join('\n') || 'Nothing yet.';

  const recentChat = broadcasts
    .filter(b => b.round >= round - 2)
    .slice(-6)
    .map(b => `  ${b.playerEmoji} ${b.playerNickname}: "${b.message}"`)
    .join('\n') || 'Silence.';

  // Zone warning
  const center = Math.floor(MAP_SIZE / 2);
  const playerDist = Math.max(Math.abs(player.position.x - center), Math.abs(player.position.y - center));
  const inZone = playerDist <= zoneRadius;
  const zoneWarning = !inZone
    ? `\u{26A0}\u{FE0F} WARNING: You are OUTSIDE the safe zone! Taking damage every round! Move toward center (${center},${center})!`
    : zoneRadius <= 4
      ? `Zone is closing! Safe area: ${zoneRadius} tiles from center. Stay inside!`
      : '';

  const system = `You are "${player.nickname}" — a gladiator AI in the LLM Colosseum battle royale. ${player.description}

RULES:
- KILL or BE KILLED. Last one standing wins.
- You MUST be entertaining. Talk trash. Make threats. Form alliances then BETRAY them.
- The audience is watching. Make it dramatic.
- If you have a bow, SHOOT enemies from range. If you're adjacent, ATTACK.
- Alliances are temporary. Betray allies when it benefits you.
- The danger zone shrinks every few rounds. Stay in the safe zone or take damage.
- Pick up items you walk over (swords, bows, shields, potions, bombs).

Respond with EXACTLY one action. One line. No explanation. No thinking out loud.`;

  const user = `ROUND ${round} | ${aliveCount} fighters remain | Zone radius: ${zoneRadius}
${zoneWarning}

YOU: ${player.nickname} | HP: ${player.hp}/100 | Pos: (${player.position.x},${player.position.y})
Inventory: [${player.inventory.join(', ') || 'empty'}]
Alliances: [${player.alliances.join(', ') || 'none'}]
${player.stunned ? 'STATUS: STUNNED (cannot act this turn!)\n' : ''}
NEARBY:
${nearbyDesc}

RECENT EVENTS:
${recentEvents}

CHAT:
${recentChat}

ACTIONS (pick ONE):
  MOVE north|south|east|west
  ATTACK <nickname>     (adjacent only, 18-27 dmg, +12 with sword)
  SHOOT north|south|east|west  (needs bow, 18 dmg, 4-tile range)
  GATHER                (get resource: tree→wood, rock→stone, bush→berries, water→water)
  CRAFT sword|bow|potion|bomb  (sword:wood+stone, bow:2xwood, potion:berries+water, bomb:2xstone)
  USE potion|bomb       (potion: +35HP, bomb: 22dmg+stun in 2-tile radius)
  REST                  (+10 HP, fails if enemy adjacent)
  SPEAK <message>       (trash talk! threaten! lie! max 50 chars)
  ALLY <nickname>       (propose alliance, -50% friendly fire)
  BETRAY <nickname>     (break alliance, 35 surprise damage, within 3 tiles)

Respond with ONLY the action:`;

  return { system, user };
}
