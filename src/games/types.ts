import { ComponentType } from 'react';

export type GameId = 'battle-royale' | 'connect-four' | 'debate' | 'prisoners-dilemma' | 'trivia';

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

export interface Standing {
  player: PlayerConfig;
  rank: number;
  kills: number;
  survived: number;
  eliminatedBy?: string;
}

export type GamePhase = 'lobby' | 'playing' | 'paused' | 'finished';

export interface GameEvent {
  round: number;
  playerId: string;
  playerNickname: string;
  description: string;
  type: string;
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

export interface GameDefinition {
  id: GameId;
  name: string;
  tagline: string;
  emoji: string;
  playerCount: { min: number; max: number };
  estimatedDuration: string;
  tags: string[];
  createInitialState(players: PlayerConfig[]): unknown;
  executeRound(
    state: unknown,
    apiKey: string,
    onAction?: (playerId: string, action: string) => void
  ): Promise<unknown>;
  isFinished(state: unknown): boolean;
  getWinner(state: unknown): PlayerConfig | null;
  getStandings(state: unknown): Standing[];
  getRound(state: unknown): number;
  getPlayers(state: unknown): { id: string; nickname: string; alive: boolean; hp: number; color: string; emoji: string }[];
  getEvents(state: unknown): GameEvent[];
  getBroadcasts(state: unknown): Broadcast[];
  ArenaComponent: ComponentType<{ gameState: unknown }>;
  ResultsComponent: ComponentType<{ gameState: unknown }>;
}
