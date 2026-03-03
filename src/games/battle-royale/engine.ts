import { GameState, Player, ActionType, PlayerConfig } from './types';
import { generateMap, spawnPlayers, generateItemDrops } from './mapGenerator';
import { buildPrompt } from './promptBuilder';
import { parseAction, resolveActions } from './actionResolver';
import { callModelWithRetry } from '../../services/novitaApi';

const INITIAL_ZONE_RADIUS = 7;
const ZONE_SHRINK_INTERVAL = 3; // Shrink every 3 rounds (was 4)
const MIN_ZONE_RADIUS = 1; // Zone gets TINY (was 2)

export function initializeGame(playerConfigs: PlayerConfig[]): GameState {
  const map = generateMap();
  const spawnPositions = spawnPlayers(map, playerConfigs.length);
  const itemDrops = generateItemDrops(map, 10); // More items at start

  const players: Player[] = playerConfigs.map((config, i) => ({
    ...config,
    hp: 100,
    maxHp: 100,
    position: spawnPositions[i],
    inventory: [],
    alive: true,
    alliances: [],
    lastAction: '',
    lastMessage: '',
    kills: 0,
    roundsSurvived: 0,
    facing: 'south' as const,
    shield: false,
    stunned: false,
  }));

  return {
    round: 0,
    phase: 'lobby',
    players,
    map,
    events: [],
    broadcasts: [],
    winner: null,
    speed: 1,
    eliminationOrder: [],
    itemDrops,
    projectiles: [],
    zoneRadius: INITIAL_ZONE_RADIUS,
  };
}

export async function executeRound(
  state: GameState,
  apiKey: string,
  onPlayerAction?: (playerId: string, action: string) => void
): Promise<GameState> {
  const newRound = state.round + 1;
  const alivePlayers = state.players.filter(p => p.alive);

  if (alivePlayers.length <= 1) {
    return { ...state, round: newRound, phase: 'finished', winner: alivePlayers[0] || null };
  }

  // Shrink zone faster
  let newZoneRadius = state.zoneRadius;
  if (newRound > 1 && newRound % ZONE_SHRINK_INTERVAL === 0 && newZoneRadius > MIN_ZONE_RADIUS) {
    newZoneRadius--;
  }

  // Spawn items every 2 rounds (was 3)
  let newDrops = [...state.itemDrops];
  if (newRound % 2 === 0) {
    const extraItems = generateItemDrops(state.map, 3);
    newDrops = [...newDrops, ...extraItems];
  }

  // Get actions from all alive players concurrently with a race timeout
  // If any model is too slow, fallback AI kicks in immediately
  const actionPromises = alivePlayers.map(async (player) => {
    if (player.stunned) {
      onPlayerAction?.(player.id, '(stunned)');
      return { playerId: player.id, action: { type: 'REST' } as ActionType, raw: '(stunned)' };
    }

    const { system, user } = buildPrompt(
      player, state.players, state.map, state.events, state.broadcasts,
      newRound, newDrops, newZoneRadius
    );

    let rawAction = '';
    try {
      rawAction = await callModelWithRetry(player.model, system, user, apiKey);
    } catch { rawAction = ''; }

    // parseAction now gets full context for smart fallback
    const parsed = parseAction(rawAction, player, state.players, state.map, newDrops, newZoneRadius);
    onPlayerAction?.(player.id, rawAction || '(AI fallback)');
    return { playerId: player.id, action: parsed, raw: rawAction };
  });

  const results = await Promise.all(actionPromises);
  const actionMap = new Map<string, ActionType>();
  for (const r of results) actionMap.set(r.playerId, r.action);

  const resolved = resolveActions(
    state.players, actionMap, state.map, newRound,
    newDrops, state.projectiles, newZoneRadius
  );

  const stillAlive = resolved.players.filter(p => p.alive);
  const isFinished = stillAlive.length <= 1;

  // Zone shrink announcement
  const newEvents = [...resolved.events];
  if (newRound > 1 && newRound % ZONE_SHRINK_INTERVAL === 0 && state.zoneRadius > MIN_ZONE_RADIUS) {
    newEvents.unshift({
      round: newRound, playerId: 'system', playerNickname: 'System',
      description: `ZONE SHRINKING! Radius now ${newZoneRadius}!`,
      type: 'zone', timestamp: Date.now(),
    });
  }

  // Passive damage for camping — if someone didn't move or attack for this round, they take chip damage
  // This prevents boring stalemates
  for (const p of resolved.players) {
    if (!p.alive) continue;
    const action = actionMap.get(p.id);
    if (action?.type === 'REST' || action?.type === 'GATHER') {
      // Campers take 3 damage
      p.hp = Math.max(0, p.hp - 3);
      if (newRound > 8) {
        // Late game campers take more
        p.hp = Math.max(0, p.hp - 5);
        newEvents.push({
          round: newRound, playerId: p.id, playerNickname: p.nickname,
          description: `${p.nickname} is camping! Arena punishes idlers! (-5 HP)`,
          type: 'system', timestamp: Date.now(),
        });
      }
    }
  }

  // Re-check eliminations after camping penalty
  for (const p of resolved.players) {
    if (p.hp <= 0 && p.alive) {
      p.alive = false;
      p.eliminatedRound = newRound;
      if (!p.eliminatedBy) p.eliminatedBy = 'the arena';
      if (!resolved.eliminations.find(e => e.id === p.id)) {
        resolved.eliminations.push({ ...p });
        newEvents.push({
          round: newRound, playerId: p.id, playerNickname: p.nickname,
          description: `${p.nickname} eliminated! (by ${p.eliminatedBy})`,
          type: 'elimination', timestamp: Date.now(),
        });
      }
    }
  }

  const finalAlive = resolved.players.filter(p => p.alive);
  const finalFinished = finalAlive.length <= 1;

  return {
    ...state,
    round: newRound,
    phase: (isFinished || finalFinished) ? 'finished' : 'playing',
    players: resolved.players,
    events: [...state.events, ...newEvents],
    broadcasts: [...state.broadcasts, ...resolved.broadcasts],
    winner: (isFinished || finalFinished) ? (finalAlive[0] || null) : null,
    eliminationOrder: [...state.eliminationOrder, ...resolved.eliminations],
    itemDrops: resolved.itemDrops,
    projectiles: resolved.projectiles,
    zoneRadius: newZoneRadius,
  };
}
