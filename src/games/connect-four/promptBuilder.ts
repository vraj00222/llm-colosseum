import { ConnectFourState, ROWS, COLS } from './types';

export function buildPrompt(
  state: ConnectFourState,
  playerIndex: 0 | 1
): { system: string; user: string } {
  const player = state.players[playerIndex];
  const opponent = state.players[playerIndex === 0 ? 1 : 0];
  const mySymbol = playerIndex === 0 ? 'X' : 'O';
  const oppSymbol = playerIndex === 0 ? 'O' : 'X';

  // Build ASCII board (top row is row 0)
  let boardStr = ' 1 2 3 4 5 6 7\n';
  for (let r = 0; r < ROWS; r++) {
    boardStr += '|';
    for (let c = 0; c < COLS; c++) {
      const cell = state.board[r][c];
      boardStr += cell === 0 ? ' .' : cell === (playerIndex + 1) ? ` ${mySymbol}` : ` ${oppSymbol}`;
    }
    boardStr += ' |\n';
  }
  boardStr += '+---------------+';

  // Valid columns
  const validCols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (state.board[0][c] === 0) validCols.push(c + 1);
  }

  // Recent moves
  const recentMoves = state.moveHistory.slice(-4).map(m => {
    const who = m.player === (playerIndex + 1) ? 'You' : opponent.nickname;
    return `${who} -> column ${m.col + 1}`;
  }).join('\n');

  const system = `You are ${player.nickname} playing Connect Four. ${player.description}
You are ${mySymbol}. Your opponent is ${opponent.nickname} (${oppSymbol}).
Connect 4 of your pieces in a row (horizontal, vertical, or diagonal) to win.
Respond with ONLY a single digit (1-7) for the column to drop your piece. Nothing else.`;

  const user = `Move ${state.round + 1} | You are ${mySymbol}

${boardStr}

Valid columns: ${validCols.join(', ')}${recentMoves ? '\nRecent moves:\n' + recentMoves : ''}

Your column:`;

  return { system, user };
}
