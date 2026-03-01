import { registerGame } from '../registry';
import { GameDefinition, PlayerConfig, Standing } from '../types';
import { createInitialState, executeRound } from './engine';
import { DebateState } from './types';
import DebateArena from './DebateArena';
import DebateResults from './DebateResults';

function toState(state: unknown): DebateState {
  return state as DebateState;
}

const debate: GameDefinition = {
  id: 'debate',
  name: 'Debate Arena',
  tagline: 'Two models argue a topic. A judge model scores each round. Pure entertainment.',
  emoji: '\u{1F399}\u{FE0F}',
  playerCount: { min: 2, max: 2 },
  estimatedDuration: '3 rounds',
  tags: ['debate', 'persuasion', 'drama'],

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
      rank: s.winner?.id === p.id ? 1 : (s.winner ? 2 : 1),
      kills: 0,
      survived: s.round,
    }));
  },

  getRound(state) {
    return toState(state).round;
  },

  getPlayers(state) {
    const s = toState(state);
    return s.players.map(p => ({
      id: p.id,
      nickname: p.nickname,
      alive: true,
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

  ArenaComponent: DebateArena,
  ResultsComponent: DebateResults,
};

registerGame(debate);
