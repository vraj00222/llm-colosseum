export type TileType = 'grass' | 'water' | 'tree' | 'rock' | 'bush' | 'lava';

export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  type: TileType;
  position: Position;
  hasResource: boolean;
}

export interface ItemDrop {
  id: string;
  type: 'sword' | 'shield' | 'bow' | 'potion' | 'bomb';
  position: Position;
}

export interface Projectile {
  id: string;
  fromPlayerId: string;
  fromNickname: string;
  position: Position;
  direction: Direction;
  damage: number;
  ttl: number; // tiles remaining
}

export interface Player {
  id: string;
  model: string;
  name: string;
  nickname: string;
  params: string;
  color: string;
  emoji: string;
  description: string;
  hp: number;
  maxHp: number;
  position: Position;
  inventory: string[];
  alive: boolean;
  alliances: string[];
  lastAction: string;
  lastMessage: string;
  kills: number;
  roundsSurvived: number;
  eliminatedRound?: number;
  eliminatedBy?: string;
  facing: Direction;
  shield: boolean; // has shield equipped
  stunned: boolean; // stunned for 1 turn (from bomb)
}

export type Direction = 'north' | 'south' | 'east' | 'west';

export type ActionType =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'ATTACK'; target: string }
  | { type: 'SHOOT'; direction: Direction }
  | { type: 'GATHER' }
  | { type: 'CRAFT'; item: 'sword' | 'potion' | 'bow' | 'bomb' }
  | { type: 'USE'; item: string }
  | { type: 'REST' }
  | { type: 'SPEAK'; message: string }
  | { type: 'ALLY'; target: string }
  | { type: 'BETRAY'; target: string };

export interface GameEvent {
  round: number;
  playerId: string;
  playerNickname: string;
  description: string;
  type: 'move' | 'attack' | 'gather' | 'craft' | 'rest' | 'speak' | 'ally' | 'betray' | 'elimination' | 'system' | 'shoot' | 'zone' | 'item' | 'use';
  timestamp: number;
}

export interface Broadcast {
  round: number;
  playerId: string;
  playerNickname: string;
  playerColor: string;
  playerEmoji: string;
  message: string;
  timestamp: number;
}

export type GamePhase = 'lobby' | 'playing' | 'paused' | 'finished';

export interface GameState {
  round: number;
  phase: GamePhase;
  players: Player[];
  map: Tile[][];
  events: GameEvent[];
  broadcasts: Broadcast[];
  winner: Player | null;
  speed: number;
  eliminationOrder: Player[];
  itemDrops: ItemDrop[];
  projectiles: Projectile[];
  zoneRadius: number; // shrinking danger zone
}

export interface PlayerConfig {
  id: string;
  model: string;
  name: string;
  nickname: string;
  params: string;
  color: string;
  emoji: string;
  description: string;
}
