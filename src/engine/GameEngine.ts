import { GameState, Player, ActionType } from './types';
import { generateMap, spawnPlayers, generateItemDrops } from './MapGenerator';
import { buildPrompt } from './PromptBuilder';
import { parseAction, resolveActions } from './ActionResolver';
import { callModelWithRetry } from '../services/novitaApi';
import { PLAYER_CONFIGS } from '../data/players';

const INITIAL_ZONE_RADIUS = 7; // full map
const ZONE_SHRINK_INTERVAL = 4; // shrink every N rounds
const MIN_ZONE_RADIUS = 2;

export function initializeGame(): GameState {
  const map = generateMap();
  const spawnPositions = spawnPlayers(map, PLAYER_CONFIGS.length);
  const itemDrops = generateItemDrops(map, 8); // Start with 8 item drops

  const players: Player[] = PLAYER_CONFIGS.map((config, i) => ({
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

  // Shrink zone every N rounds
  let newZoneRadius = state.zoneRadius;
  if (newRound > 1 && newRound % ZONE_SHRINK_INTERVAL === 0 && newZoneRadius > MIN_ZONE_RADIUS) {
    newZoneRadius--;
  }

  // Spawn new items occasionally
  let newDrops = [...state.itemDrops];
  if (newRound % 3 === 0) {
    const extraItems = generateItemDrops(state.map, 2);
    newDrops = [...newDrops, ...extraItems];
  }

  // Get actions from all alive players concurrently
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

    const parsed = parseAction(rawAction, player, state.players);
    onPlayerAction?.(player.id, rawAction || '(no response)');
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
      description: `\u{26A0}\u{FE0F} DANGER ZONE SHRINKING! Safe radius now ${newZoneRadius}. Get to the center!`,
      type: 'zone', timestamp: Date.now(),
    });
  }

  return {
    ...state,
    round: newRound,
    phase: isFinished ? 'finished' : 'playing',
    players: resolved.players,
    events: [...state.events, ...newEvents],
    broadcasts: [...state.broadcasts, ...resolved.broadcasts],
    winner: isFinished ? (stillAlive[0] || null) : null,
    eliminationOrder: [...state.eliminationOrder, ...resolved.eliminations],
    itemDrops: resolved.itemDrops,
    projectiles: resolved.projectiles,
    zoneRadius: newZoneRadius,
  };
}
