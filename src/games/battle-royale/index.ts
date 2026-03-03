import { registerGame } from '../registry';
import { GameDefinition, PlayerConfig, Standing } from '../types';
import { initializeGame, executeRound } from './engine';
import { GameState, Player } from './types';
import BattleRoyaleArena from './BattleRoyaleArena';
import BattleRoyaleResults from './BattleRoyaleResults';

function toGameState(state: unknown): GameState {
  return state as GameState;
}

const battleRoyale: GameDefinition = {
  id: 'battle-royale',
  name: 'Battle Royale',
  tagline: '6 AI models enter. 1 survives. You just watch.',
  emoji: '',
  playerCount: { min: 3, max: 6 },
  estimatedDuration: '~25 rounds',
  tags: ['combat', 'strategy', 'alliances'],

  createInitialState(players: PlayerConfig[]) {
    return initializeGame(players);
  },

  async executeRound(state, apiKey, onAction) {
    return executeRound(toGameState(state), apiKey, onAction);
  },

  isFinished(state) {
    return toGameState(state).phase === 'finished';
  },

  getWinner(state) {
    const gs = toGameState(state);
    if (!gs.winner) return null;
    return {
      id: gs.winner.id,
      model: gs.winner.model,
      name: gs.winner.name,
      nickname: gs.winner.nickname,
      params: gs.winner.params,
      color: gs.winner.color,
      emoji: gs.winner.emoji,
      description: gs.winner.description,
    };
  },

  getStandings(state): Standing[] {
    const gs = toGameState(state);
    const alive = gs.players.filter(p => p.alive);
    const dead = [...gs.eliminationOrder].reverse();
    const ordered: Player[] = [...alive, ...dead];
    return ordered.map((p, i) => ({
      player: { id: p.id, model: p.model, name: p.name, nickname: p.nickname, params: p.params, color: p.color, emoji: p.emoji, description: p.description },
      rank: i + 1,
      kills: p.kills,
      survived: p.roundsSurvived,
      eliminatedBy: p.eliminatedBy,
    }));
  },

  getRound(state) {
    return toGameState(state).round;
  },

  getPlayers(state) {
    return toGameState(state).players.map(p => ({
      id: p.id, nickname: p.nickname, alive: p.alive, hp: p.hp, color: p.color, emoji: p.emoji,
    }));
  },

  getEvents(state) {
    return toGameState(state).events;
  },

  getBroadcasts(state) {
    return toGameState(state).broadcasts;
  },

  ArenaComponent: BattleRoyaleArena,
  ResultsComponent: BattleRoyaleResults,
};

registerGame(battleRoyale);
