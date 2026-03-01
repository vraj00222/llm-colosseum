import { create } from 'zustand';
import { GameId, GamePhase, PlayerConfig } from '../games/types';
import { getGame } from '../games/registry';
import { GameState, Player } from '../games/battle-royale/types';
import { PLAYER_CONFIGS } from '../data/players';

// Import games to trigger registration
import '../games/battle-royale';

interface GameStore {
  // Game-agnostic fields
  apiKey: string;
  currentGameId: GameId;
  selectedPlayers: PlayerConfig[];
  gameState: unknown;
  phase: GamePhase;
  isRunning: boolean;
  speed: number;
  round: number;
  rawActions: Map<string, string>;

  // Battle Royale backward compat — spread from gameState
  players: Player[];
  map: GameState['map'];
  events: GameState['events'];
  broadcasts: GameState['broadcasts'];
  winner: Player | null;
  eliminationOrder: Player[];
  itemDrops: GameState['itemDrops'];
  projectiles: GameState['projectiles'];
  zoneRadius: number;
  latestElimination: Player | null;

  // Actions
  setApiKey: (key: string) => void;
  selectGame: (id: GameId) => void;
  setSelectedPlayers: (players: PlayerConfig[]) => void;
  startGame: () => void;
  setSpeed: (speed: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  runGameLoop: () => Promise<void>;
  resetGame: () => void;
  setPhase: (phase: GamePhase) => void;
}

function extractBattleRoyaleState(gameState: unknown): Partial<GameStore> {
  const gs = gameState as GameState;
  // Do NOT include phase/round — those are managed by the store and would
  // overwrite the store's values (e.g. phase:'lobby' overwrites phase:'playing')
  return {
    players: gs.players,
    map: gs.map,
    events: gs.events,
    broadcasts: gs.broadcasts,
    winner: gs.winner,
    eliminationOrder: gs.eliminationOrder,
    itemDrops: gs.itemDrops,
    projectiles: gs.projectiles,
    zoneRadius: gs.zoneRadius,
  };
}

const defaultBRState: Partial<GameStore> = {
  players: [],
  map: [],
  events: [],
  broadcasts: [],
  winner: null,
  eliminationOrder: [],
  itemDrops: [],
  projectiles: [],
  zoneRadius: 7,
};

export const useGame = create<GameStore>((set, get) => ({
  apiKey: localStorage.getItem('novita_api_key') || import.meta.env.VITE_NOVITA_API_KEY || '',
  currentGameId: 'battle-royale',
  selectedPlayers: PLAYER_CONFIGS,
  gameState: null,
  phase: 'lobby',
  isRunning: false,
  speed: 1,
  round: 0,
  rawActions: new Map(),
  latestElimination: null,
  ...defaultBRState as any,

  setApiKey: (key: string) => {
    localStorage.setItem('novita_api_key', key);
    set({ apiKey: key });
  },

  selectGame: (id: GameId) => set({ currentGameId: id }),

  setSelectedPlayers: (players: PlayerConfig[]) => set({ selectedPlayers: players }),

  startGame: () => {
    const { currentGameId, selectedPlayers } = get();
    const game = getGame(currentGameId);
    const gameState = game.createInitialState(selectedPlayers);
    const brState = currentGameId === 'battle-royale' ? extractBattleRoyaleState(gameState) : {};
    set({
      gameState,
      phase: 'playing',
      isRunning: true,
      round: game.getRound(gameState),
      latestElimination: null,
      rawActions: new Map(),
      ...brState,
    });
  },

  setSpeed: (speed: number) => set({ speed }),
  pauseGame: () => set({ phase: 'paused', isRunning: false }),
  resumeGame: () => set({ phase: 'playing', isRunning: true }),
  setPhase: (phase: GamePhase) => set({ phase }),

  resetGame: () => {
    set({
      gameState: null,
      phase: 'lobby',
      isRunning: false,
      round: 0,
      latestElimination: null,
      rawActions: new Map(),
      ...defaultBRState as any,
    });
  },

  runGameLoop: async () => {
    const state = get();
    if (!state.isRunning || state.phase !== 'playing' || !state.gameState) return;

    const game = getGame(state.currentGameId);
    const rawActions = new Map<string, string>();

    const newGameState = await game.executeRound(
      state.gameState,
      state.apiKey,
      (playerId, action) => { rawActions.set(playerId, action); }
    );

    const finished = game.isFinished(newGameState);
    const newRound = game.getRound(newGameState);

    // Detect new eliminations for battle royale
    let latestElim: Player | null = null;
    if (state.currentGameId === 'battle-royale') {
      const oldElims = (state.gameState as GameState).eliminationOrder;
      const newElims = (newGameState as GameState).eliminationOrder;
      const freshElims = newElims.slice(oldElims.length);
      latestElim = freshElims.length > 0 ? freshElims[freshElims.length - 1] : null;
    }

    const currentSpeed = get().speed;
    const brState = state.currentGameId === 'battle-royale' ? extractBattleRoyaleState(newGameState) : {};

    set({
      gameState: newGameState,
      phase: finished ? 'finished' : 'playing',
      round: newRound,
      speed: currentSpeed,
      isRunning: !finished,
      latestElimination: latestElim,
      rawActions,
      ...brState,
    });
  },
}));
