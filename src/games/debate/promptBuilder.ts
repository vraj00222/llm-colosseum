import { DebateState } from './types';

export function buildDebatePrompt(
  state: DebateState,
  playerIndex: 0 | 1
): { system: string; user: string } {
  const player = state.players[playerIndex];
  const opponent = state.players[playerIndex === 0 ? 1 : 0];
  const side = playerIndex === 0 ? 'FOR' : 'AGAINST';
  const oppSide = playerIndex === 0 ? 'AGAINST' : 'FOR';

  // Previous arguments
  const prevArgs = state.arguments
    .filter(a => a.round < state.round + 1)
    .map(a => {
      const who = a.playerId === player.id ? `You (${side})` : `${opponent.nickname} (${oppSide})`;
      return `[Round ${a.round}] ${who}: ${a.content}`;
    })
    .join('\n\n');

  const system = `You are ${player.nickname}, a masterful debater. ${player.description}
You are arguing ${side} the topic: "${state.topic}"
Be persuasive, witty, and entertaining. Use clever analogies and sharp logic.
Keep your argument to 2-3 sentences. Be punchy, not verbose.
Respond with ONLY your argument. No labels, no "I argue that...", just the argument itself.`;

  const user = `TOPIC: "${state.topic}"
You are arguing: ${side}
Round ${state.round + 1} of ${state.maxRounds}

${prevArgs ? `PREVIOUS ARGUMENTS:\n${prevArgs}\n\n` : ''}${state.round > 0 ? `Counter your opponent's last point and strengthen your position.` : `Make your opening argument.`}

Your argument:`;

  return { system, user };
}

export function buildJudgePrompt(
  state: DebateState,
  roundNum: number
): { system: string; user: string } {
  const forPlayer = state.players[0];
  const againstPlayer = state.players[1];

  const roundArgs = state.arguments.filter(a => a.round === roundNum);
  const forArg = roundArgs.find(a => a.side === 'for')?.content || '(no argument)';
  const againstArg = roundArgs.find(a => a.side === 'against')?.content || '(no argument)';

  const system = `You are an impartial debate judge. Score each side's argument from 1-10 based on:
- Persuasiveness and logic
- Wit and entertainment value
- How well they countered the opponent
Respond in EXACTLY this format (nothing else):
FOR: [score]
AGAINST: [score]
REASON: [one sentence why]`;

  const user = `TOPIC: "${state.topic}"
Round ${roundNum} of ${state.maxRounds}

${forPlayer.nickname} (FOR): ${forArg}

${againstPlayer.nickname} (AGAINST): ${againstArg}

Score each argument 1-10:`;

  return { system, user };
}
