import { create } from 'zustand';
import { GameState, GamePhase, Player } from '../engine/types';
import { initializeGame, executeRound } from '../engine/GameEngine';

interface GameStore extends GameState {
  apiKey: string;
  isRunning: boolean;
  latestElimination: Player | null;
  rawActions: Map<string, string>;

  setApiKey: (key: string) => void;
  startGame: () => void;
  setSpeed: (speed: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  runGameLoop: () => Promise<void>;
  resetGame: () => void;
  setPhase: (phase: GamePhase) => void;
}

export const useGame = create<GameStore>((set, get) => ({
  ...initializeGame(),
  apiKey: localStorage.getItem('novita_api_key') || import.meta.env.VITE_NOVITA_API_KEY || '',
  isRunning: false,
  latestElimination: null,
  rawActions: new Map(),

  setApiKey: (key: string) => {
    localStorage.setItem('novita_api_key', key);
    set({ apiKey: key });
  },

  startGame: () => {
    const fresh = initializeGame();
    set({
      ...fresh,
      phase: 'playing',
      isRunning: true,
      latestElimination: null,
      rawActions: new Map(),
    });
  },

  setSpeed: (speed: number) => set({ speed }),
  pauseGame: () => set({ phase: 'paused', isRunning: false }),
  resumeGame: () => set({ phase: 'playing', isRunning: true }),
  setPhase: (phase: GamePhase) => set({ phase }),

  resetGame: () => {
    const fresh = initializeGame();
    set({ ...fresh, isRunning: false, latestElimination: null, rawActions: new Map() });
  },

  runGameLoop: async () => {
    const state = get();
    if (!state.isRunning || state.phase !== 'playing') return;

    const rawActions = new Map<string, string>();
    const newState = await executeRound(
      {
        round: state.round, phase: state.phase, players: state.players,
        map: state.map, events: state.events, broadcasts: state.broadcasts,
        winner: state.winner, speed: state.speed,
        eliminationOrder: state.eliminationOrder,
        itemDrops: state.itemDrops, projectiles: state.projectiles,
        zoneRadius: state.zoneRadius,
      },
      state.apiKey,
      (playerId, action) => { rawActions.set(playerId, action); }
    );

    const newElims = newState.eliminationOrder.slice(state.eliminationOrder.length);
    const latestElim = newElims.length > 0 ? newElims[newElims.length - 1] : null;

    const currentSpeed = get().speed;
    set({
      ...newState,
      speed: currentSpeed,
      isRunning: newState.phase === 'playing',
      latestElimination: latestElim,
      rawActions,
    });
  },
}));
