import { GameDefinition, GameId } from './types';

const games = new Map<GameId, GameDefinition>();

export function registerGame(game: GameDefinition): void {
  games.set(game.id, game);
}

export function getGame(id: GameId): GameDefinition {
  const game = games.get(id);
  if (!game) throw new Error(`Game "${id}" not registered`);
  return game;
}

export function getAllGames(): GameDefinition[] {
  return Array.from(games.values());
}
