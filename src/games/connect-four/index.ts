import { registerGame } from '../registry';
import { GameDefinition, PlayerConfig, Standing } from '../types';
import { createInitialState, executeRound } from './engine';
import { ConnectFourState } from './types';
import ConnectFourArena from './ConnectFourArena';
import ConnectFourResults from './ConnectFourResults';

function toState(state: unknown): ConnectFourState {
  return state as ConnectFourState;
}

const connectFour: GameDefinition = {
  id: 'connect-four',
  name: 'Connect Four',
  tagline: 'Two AI models drop discs. First to connect four wins.',
  emoji: '\u{1F534}',
  playerCount: { min: 2, max: 2 },
  estimatedDuration: '~15 moves',
  tags: ['classic', 'strategy', 'visual'],

  createInitialState(players: PlayerConfig[]) {
    return createInitialState(players);
  },

  async executeRound(state, apiKey, onAction) {
    return executeRound(toState(state), apiKey, onAction);
  },

  isFinished(state) {
    return toState(state).phase === 'finished';
  },

  getWinner(state) {
    return toState(state).winner;
  },

  getStandings(state): Standing[] {
    const s = toState(state);
    return s.players.map((p, i) => ({
      player: p,
      rank: s.winner?.id === p.id ? 1 : 2,
      kills: 0,
      survived: s.round,
      eliminatedBy: s.winner && s.winner.id !== p.id ? s.winner.nickname : undefined,
    }));
  },

  getRound(state) {
    return toState(state).round;
  },

  getPlayers(state) {
    const s = toState(state);
    return s.players.map((p, i) => ({
      id: p.id,
      nickname: p.nickname,
      alive: s.phase === 'playing' || s.winner?.id === p.id,
      hp: 100,
      color: p.color,
      emoji: p.emoji,
    }));
  },

  getEvents(state) {
    return toState(state).events;
  },

  getBroadcasts(state) {
    return toState(state).broadcasts;
  },

  ArenaComponent: ConnectFourArena,
  ResultsComponent: ConnectFourResults,
};

registerGame(connectFour);
