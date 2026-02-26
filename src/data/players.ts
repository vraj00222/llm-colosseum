import { PlayerConfig } from '../engine/types';

export const PLAYER_CONFIGS: PlayerConfig[] = [
  {
    id: "deepseek-v3.2",
    model: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    nickname: "The Strategist",
    params: "685B",
    color: "#4A90D9",
    emoji: "\u{1F9E0}",
    description: "Overthinks every move. Forms complex strategies that somehow work."
  },
  {
    id: "qwen3.5-397b",
    model: "qwen/qwen3.5-397b-a17b",
    name: "Qwen 3.5",
    nickname: "The Shadow",
    params: "397B",
    color: "#00B894",
    emoji: "\u{1F432}",
    description: "Quiet, calculating, strikes when you least expect."
  },
  {
    id: "kimi-k2.5",
    model: "moonshotai/kimi-k2.5",
    name: "Kimi K2.5",
    nickname: "The Diplomat",
    params: "~1T",
    color: "#6C5CE7",
    emoji: "\u{1F3AD}",
    description: "Smooth talker. Will betray you with a smile."
  },
  {
    id: "glm-5",
    model: "zai-org/glm-5",
    name: "GLM-5",
    nickname: "The Brawler",
    params: "Large",
    color: "#E85D3A",
    emoji: "\u{1F4AA}",
    description: "Fast, aggressive, zero hesitation. Punches first, thinks never."
  },
  {
    id: "minimax-m2.5",
    model: "minimax/minimax-m2.5",
    name: "MiniMax M2.5",
    nickname: "The Wildcard",
    params: "Large",
    color: "#FDCB6E",
    emoji: "\u{1F300}",
    description: "Nobody knows what it'll do next. Including itself."
  },
  {
    id: "qwen3-coder",
    model: "qwen/qwen3-coder-480b-a35b-instruct",
    name: "Qwen3 Coder",
    nickname: "The Underdog",
    params: "480B",
    color: "#E17055",
    emoji: "\u{1F48E}",
    description: "A code model thrown into combat. Heart of a champion."
  },
];
