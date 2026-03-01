import { PlayerConfig } from '../types';

export interface DebateArgument {
  playerId: string;
  round: number;
  side: 'for' | 'against';
  content: string;
  timestamp: number;
}

export interface JudgeScore {
  round: number;
  forScore: number;
  againstScore: number;
  reasoning: string;
}

export interface DebateState {
  topic: string;
  players: [PlayerConfig, PlayerConfig]; // [FOR, AGAINST]
  round: number;
  maxRounds: number;
  phase: 'playing' | 'finished';
  arguments: DebateArgument[];
  scores: JudgeScore[];
  winner: PlayerConfig | null;
  totalScores: [number, number]; // [FOR total, AGAINST total]
  events: { round: number; playerId: string; playerNickname: string; description: string; type: string; timestamp: number }[];
  broadcasts: { round: number; playerId: string; playerNickname: string; playerColor: string; playerEmoji: string; message: string; timestamp: number }[];
}
