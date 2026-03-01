import { PlayerConfig } from '../types';

export const ROWS = 6;
export const COLS = 7;

export type CellValue = 0 | 1 | 2; // 0 = empty, 1 = player1, 2 = player2

export interface ConnectFourState {
  board: CellValue[][];
  players: [PlayerConfig, PlayerConfig];
  currentTurn: 0 | 1; // index into players
  round: number;
  phase: 'playing' | 'finished';
  winner: PlayerConfig | null;
  isDraw: boolean;
  moveHistory: { player: number; col: number; row: number }[];
  lastMove: { col: number; row: number } | null;
  winningCells: { row: number; col: number }[] | null;
  broadcasts: { round: number; playerId: string; playerNickname: string; playerColor: string; playerEmoji: string; message: string; timestamp: number }[];
  events: { round: number; playerId: string; playerNickname: string; description: string; type: string; timestamp: number }[];
}
