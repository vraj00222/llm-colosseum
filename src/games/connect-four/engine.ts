import { PlayerConfig } from '../types';
import { ConnectFourState, ROWS, COLS, CellValue } from './types';
import { buildPrompt } from './promptBuilder';
import { callModel } from '../../services/novitaApi';

export function createInitialState(players: PlayerConfig[]): ConnectFourState {
  const board: CellValue[][] = [];
  for (let r = 0; r < ROWS; r++) {
    board.push(new Array(COLS).fill(0));
  }
  return {
    board,
    players: [players[0], players[1]],
    currentTurn: 0,
    round: 0,
    phase: 'playing',
    winner: null,
    isDraw: false,
    moveHistory: [],
    lastMove: null,
    winningCells: null,
    broadcasts: [],
    events: [],
  };
}

export async function executeRound(
  state: ConnectFourState,
  apiKey: string,
  onAction?: (playerId: string, action: string) => void
): Promise<ConnectFourState> {
  if (state.phase === 'finished') return state;

  const player = state.players[state.currentTurn];
  const playerNum = state.currentTurn + 1;
  const newRound = state.round + 1;

  const { system, user } = buildPrompt(state, state.currentTurn);

  let col = -1;
  let rawAction = '';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    rawAction = await callModel(player.model, system, user, apiKey);
    clearTimeout(timeout);
  } catch {
    rawAction = '';
  }

  onAction?.(player.id, rawAction || '(timeout)');

  // Parse column from response
  const match = rawAction.match(/(\d)/);
  if (match) {
    const parsed = parseInt(match[1]);
    if (parsed >= 1 && parsed <= 7) col = parsed - 1;
  }

  // Validate column (must have space)
  if (col < 0 || col >= COLS || state.board[0][col] !== 0) {
    // Find first valid column
    const validCols = [];
    for (let c = 0; c < COLS; c++) {
      if (state.board[0][c] === 0) validCols.push(c);
    }
    if (validCols.length === 0) {
      // Board is full — draw
      return {
        ...state,
        round: newRound,
        phase: 'finished',
        isDraw: true,
      };
    }
    // Pick center-biased column
    validCols.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
    col = validCols[0];
  }

  // Drop disc
  const newBoard = state.board.map(row => [...row]);
  let dropRow = -1;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (newBoard[r][col] === 0) {
      newBoard[r][col] = playerNum as CellValue;
      dropRow = r;
      break;
    }
  }

  const newEvents = [...state.events, {
    round: newRound,
    playerId: player.id,
    playerNickname: player.nickname,
    description: `${player.emoji} ${player.nickname} drops in column ${col + 1}`,
    type: 'move',
    timestamp: Date.now(),
  }];

  // Check win
  const winCells = checkWin(newBoard, dropRow, col, playerNum as CellValue);

  // Check draw
  const boardFull = newBoard[0].every(c => c !== 0);

  if (winCells) {
    return {
      ...state,
      board: newBoard,
      round: newRound,
      phase: 'finished',
      winner: player,
      lastMove: { col, row: dropRow },
      winningCells: winCells,
      moveHistory: [...state.moveHistory, { player: playerNum, col, row: dropRow }],
      events: newEvents,
    };
  }

  if (boardFull) {
    return {
      ...state,
      board: newBoard,
      round: newRound,
      phase: 'finished',
      isDraw: true,
      lastMove: { col, row: dropRow },
      moveHistory: [...state.moveHistory, { player: playerNum, col, row: dropRow }],
      events: newEvents,
    };
  }

  return {
    ...state,
    board: newBoard,
    round: newRound,
    currentTurn: (state.currentTurn === 0 ? 1 : 0) as 0 | 1,
    lastMove: { col, row: dropRow },
    moveHistory: [...state.moveHistory, { player: playerNum, col, row: dropRow }],
    events: newEvents,
  };
}

function checkWin(board: CellValue[][], row: number, col: number, player: CellValue): { row: number; col: number }[] | null {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal down-left
  ];

  for (const [dr, dc] of directions) {
    const cells: { row: number; col: number }[] = [{ row, col }];

    // Check forward
    for (let i = 1; i < 4; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      cells.push({ row: r, col: c });
    }

    // Check backward
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      cells.push({ row: r, col: c });
    }

    if (cells.length >= 4) return cells;
  }

  return null;
}
