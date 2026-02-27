import { Player, Tile, GameEvent, Broadcast, Position, ItemDrop } from './types';
import { MAP_SIZE, isInSafeZone } from './MapGenerator';

function dist(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function buildPrompt(
  player: Player,
  allPlayers: Player[],
  _map: Tile[][],
  events: GameEvent[],
  broadcasts: Broadcast[],
  round: number,
  itemDrops: ItemDrop[],
  zoneRadius: number
): { system: string; user: string } {
  const alive = allPlayers.filter(p => p.alive && p.id !== player.id);
  const center = Math.floor(MAP_SIZE / 2);
  const inZone = isInSafeZone(player.position, zoneRadius);

  // Nearby players
  const nearby = alive
    .map(p => ({ p, d: dist(player.position, p.position) }))
    .filter(x => x.d <= 5)
    .sort((a, b) => a.d - b.d);

  const playerLines = nearby.map(({ p, d }) => {
    const adj = d === 1 ? ' **ADJACENT-KILL NOW!**' : '';
    const ally = player.alliances.includes(p.nickname) ? ' [ally]' : '';
    const weap = p.inventory.filter(i => ['sword', 'bow', 'bomb', 'shield'].includes(i));
    return `${p.emoji} ${p.nickname} HP:${p.hp} dist:${d}${adj}${ally}${weap.length ? ` [${weap.join(',')}]` : ''}`;
  }).join('\n') || 'Nobody nearby — MOVE to find enemies!';

  // Nearby items
  const nearItems = itemDrops
    .filter(i => dist(player.position, i.position) <= 3)
    .map(i => `${i.type} at (${i.position.x},${i.position.y})`);

  // Recent events (very short)
  const recentEvents = events
    .filter(e => e.round >= round - 1 && e.type !== 'move' && e.type !== 'system')
    .slice(-5)
    .map(e => e.description)
    .join('\n') || '';

  // Recent chat
  const recentChat = broadcasts
    .filter(b => b.round >= round - 1)
    .slice(-3)
    .map(b => `${b.playerNickname}: "${b.message}"`)
    .join('\n') || '';

  // Zone urgency — give EXACT direction to run
  let urgency = '';
  if (!inZone) {
    const dirs: string[] = [];
    if (player.position.x < center - zoneRadius) dirs.push('east');
    if (player.position.x > center + zoneRadius) dirs.push('west');
    if (player.position.y < center - zoneRadius) dirs.push('south');
    if (player.position.y > center + zoneRadius) dirs.push('north');
    const moveDir = dirs[0] || (player.position.x < center ? 'east' : 'west');
    urgency = `\n!! DEATH ZONE! You take massive damage EVERY ROUND here! MOVE ${moveDir.toUpperCase()} immediately to survive! DO: MOVE ${moveDir} !!`;
  } else if (zoneRadius <= 3) {
    urgency = '\n!! ZONE IS TINY! FIGHT OR DIE! Everyone is close — ATTACK! !!';
  } else if (zoneRadius <= 5) {
    urgency = '\n! Zone closing fast. Get to center and fight!';
  }

  // Panic level based on round
  const panicNote = round >= 15 ? 'ENDGAME — kill everyone NOW!'
    : round >= 10 ? 'Late game. Be aggressive. Kill or be killed.'
    : round >= 5 ? 'Mid game. Hunt enemies. No hiding.'
    : 'Early game. Gear up fast, then FIGHT.';

  const system = `You are ${player.nickname} in a battle royale. ${player.description}
RULES:
- ZONE: Safe area is ${zoneRadius} tiles from center (${center},${center}). If outside, you LOSE 8-25 HP/round. ALWAYS move inside the zone first!
- Adjacent enemy = ATTACK <name>. Have bow = SHOOT n/s/e/w. Kill to survive.
- Be aggressive, dramatic, entertaining. Talk trash with SPEAK.
Respond with EXACTLY ONE action line. Nothing else.`;

  const user = `R${round} | ${alive.length + 1} left | Zone:${zoneRadius} | ${panicNote}${urgency}

YOU: ${player.nickname} HP:${player.hp} at (${player.position.x},${player.position.y}) ${inZone ? 'SAFE' : 'OUTSIDE ZONE - MOVE IN!'}
Items: [${player.inventory.join(',') || 'none'}] Allies: [${player.alliances.join(',') || 'none'}]${player.lastAction ? `\nLast turn: ${player.lastAction}` : ''}

NEARBY:
${playerLines}${nearItems.length ? '\nITEMS: ' + nearItems.join(', ') : ''}${recentEvents ? '\nEVENTS:\n' + recentEvents : ''}${recentChat ? '\nCHAT:\n' + recentChat : ''}

ACTIONS: MOVE n/s/e/w | ATTACK <name> | SHOOT n/s/e/w | SPEAK <msg> | ALLY <name> | BETRAY <name> | USE potion/bomb | GATHER | CRAFT sword/bow/potion/bomb | REST
Your action:`;

  return { system, user };
}
