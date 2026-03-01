import Champion from '../../components/results/Champion';
import Standings from '../../components/results/Standings';
import PostGameInterview from '../../components/results/PostGameInterview';
import { useGame } from '../../hooks/useGame';
import { GameState } from './types';

export default function BattleRoyaleResults() {
  const { gameState, apiKey } = useGame();
  const state = gameState as GameState;

  return (
    <>
      {state.winner && <Champion winner={state.winner} />}
      <Standings players={state.players} eliminationOrder={state.eliminationOrder} />
      <PostGameInterview
        players={state.players}
        winner={state.winner}
        apiKey={apiKey}
      />
    </>
  );
}
