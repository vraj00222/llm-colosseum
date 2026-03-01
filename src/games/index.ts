export { registerGame, getGame, getAllGames } from './registry';
export type { GameDefinition, GameId, PlayerConfig, Standing, GamePhase, GameEvent, Broadcast } from './types';

// Register all games
import './battle-royale';
import './connect-four';
import './debate';
