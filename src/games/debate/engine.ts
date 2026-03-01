import { PlayerConfig } from '../types';
import { DebateState, DebateArgument, JudgeScore } from './types';
import { buildDebatePrompt, buildJudgePrompt } from './promptBuilder';
import { callModel } from '../../services/novitaApi';

const DEFAULT_TOPIC = 'Is a hotdog a sandwich?';
const MAX_ROUNDS = 3;

// Use a strong model as judge - first available from the debate players
const JUDGE_MODEL = 'deepseek/deepseek-v3.2';

export function createInitialState(players: PlayerConfig[]): DebateState {
  const topic = localStorage.getItem('debate_topic') || DEFAULT_TOPIC;

  return {
    topic,
    players: [players[0], players[1]],
    round: 0,
    maxRounds: MAX_ROUNDS,
    phase: 'playing',
    arguments: [],
    scores: [],
    winner: null,
    totalScores: [0, 0],
    events: [],
    broadcasts: [],
  };
}

async function callDebateModel(
  model: string,
  system: string,
  user: string,
  apiKey: string
): Promise<string> {
  const NOVITA_API_URL = 'https://api.novita.ai/v3/openai/chat/completions';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(NOVITA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: 200,
        temperature: 0.9,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  } catch {
    clearTimeout(timeout);
    return '';
  }
}

export async function executeRound(
  state: DebateState,
  apiKey: string,
  onAction?: (playerId: string, action: string) => void
): Promise<DebateState> {
  if (state.phase === 'finished') return state;

  const currentRound = state.round + 1;
  const ts = Date.now();

  // Both debaters argue simultaneously
  const [forPrompt, againstPrompt] = [
    buildDebatePrompt(state, 0),
    buildDebatePrompt(state, 1),
  ];

  const [forResponse, againstResponse] = await Promise.all([
    callDebateModel(state.players[0].model, forPrompt.system, forPrompt.user, apiKey),
    callDebateModel(state.players[1].model, againstPrompt.system, againstPrompt.user, apiKey),
  ]);

  onAction?.(state.players[0].id, forResponse || '(no response)');
  onAction?.(state.players[1].id, againstResponse || '(no response)');

  const forArg: DebateArgument = {
    playerId: state.players[0].id,
    round: currentRound,
    side: 'for',
    content: forResponse || "I stand firmly in favor of this position.",
    timestamp: ts,
  };

  const againstArg: DebateArgument = {
    playerId: state.players[1].id,
    round: currentRound,
    side: 'against',
    content: againstResponse || "I strongly oppose this position.",
    timestamp: ts + 1,
  };

  const newArguments = [...state.arguments, forArg, againstArg];

  // Create updated state for judging
  const stateWithArgs: DebateState = {
    ...state,
    round: currentRound,
    arguments: newArguments,
  };

  // Judge scores this round
  const judgePrompt = buildJudgePrompt(stateWithArgs, currentRound);
  const judgeResponse = await callDebateModel(JUDGE_MODEL, judgePrompt.system, judgePrompt.user, apiKey);

  let forScore = 5, againstScore = 5, reasoning = 'Both sides made valid points.';
  const forMatch = judgeResponse.match(/FOR:\s*(\d+)/i);
  const againstMatch = judgeResponse.match(/AGAINST:\s*(\d+)/i);
  const reasonMatch = judgeResponse.match(/REASON:\s*(.+)/i);

  if (forMatch) forScore = Math.min(10, Math.max(1, parseInt(forMatch[1])));
  if (againstMatch) againstScore = Math.min(10, Math.max(1, parseInt(againstMatch[1])));
  if (reasonMatch) reasoning = reasonMatch[1].trim();

  const newScore: JudgeScore = {
    round: currentRound,
    forScore,
    againstScore,
    reasoning,
  };

  const newTotalScores: [number, number] = [
    state.totalScores[0] + forScore,
    state.totalScores[1] + againstScore,
  ];

  const isLastRound = currentRound >= state.maxRounds;

  // Determine winner
  let winner: PlayerConfig | null = null;
  if (isLastRound) {
    if (newTotalScores[0] > newTotalScores[1]) winner = state.players[0];
    else if (newTotalScores[1] > newTotalScores[0]) winner = state.players[1];
    // null = draw
  }

  const newEvents = [
    ...state.events,
    {
      round: currentRound,
      playerId: state.players[0].id,
      playerNickname: state.players[0].nickname,
      description: `${state.players[0].emoji} ${state.players[0].nickname} argues FOR (Score: ${forScore}/10)`,
      type: 'speak',
      timestamp: ts,
    },
    {
      round: currentRound,
      playerId: state.players[1].id,
      playerNickname: state.players[1].nickname,
      description: `${state.players[1].emoji} ${state.players[1].nickname} argues AGAINST (Score: ${againstScore}/10)`,
      type: 'speak',
      timestamp: ts + 1,
    },
  ];

  const newBroadcasts = [
    ...state.broadcasts,
    {
      round: currentRound,
      playerId: state.players[0].id,
      playerNickname: state.players[0].nickname,
      playerColor: state.players[0].color,
      playerEmoji: state.players[0].emoji,
      message: forArg.content,
      timestamp: ts,
    },
    {
      round: currentRound,
      playerId: state.players[1].id,
      playerNickname: state.players[1].nickname,
      playerColor: state.players[1].color,
      playerEmoji: state.players[1].emoji,
      message: againstArg.content,
      timestamp: ts + 1,
    },
  ];

  return {
    ...state,
    round: currentRound,
    phase: isLastRound ? 'finished' : 'playing',
    arguments: newArguments,
    scores: [...state.scores, newScore],
    winner,
    totalScores: newTotalScores,
    events: newEvents,
    broadcasts: newBroadcasts,
  };
}
