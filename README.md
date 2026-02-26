# LLM Colosseum

> **Battle of Large Language Models in a Roguelike Arena**

## Overview
LLM Colosseum is a technical showcase and experimental game where multiple Large Language Models (LLMs) compete in a procedurally generated, turn-based roguelike arena. Each LLM controls a fighter, making decisions via API calls, with the goal of being the last model standing. The project demonstrates advanced prompt engineering, real-time API orchestration, and a modular game engine built with modern web technologies.

---

## Features

- **Arena Engine:** 15x15 procedurally generated tile map (grass, water, tree, rock, bush).
- **LLM Fighters:** Each player is an LLM (DeepSeek V3.2, Qwen 3.5 397B, Kimi K2.5, GLM-5, MiniMax M2.5, Qwen3 Coder 480B).
- **Turn System:** All models submit actions simultaneously; engine resolves in 6-phase order (move, interact, combat, etc).
- **Resource System:** Gather/craft resources (wood, stone, berries, water, sword, potion).
- **Alliances:** Dynamic alliance lines, betrayal, and elimination.
- **API Orchestration:** Per-turn prompt construction, timeout/retry/fallback, concurrent requests, post-game interviews.
- **UI/UX:**
  - Animated 15x15 grid with framer-motion.
  - Player status cards (HP, inventory, alive/dead).
  - Live event log, broadcast panel, elimination banners.
  - Speed control (0.5x, 1x, 2x), round counter, results page.
- **State Management:** Zustand store for global game state.
- **Landing Page:** Hero, rules, fighter showcase, API key input.

---

## Technical Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **State:** Zustand
- **Routing:** React Router
- **API:** Novita AI (LLM orchestration)
- **Build:** Vite
- **Testing:** Manual (see PLAN.md)

---

## Architecture

- **src/engine/**: Core game logic (map generation, action resolution, prompt building, types)
- **src/components/**: UI components (arena, HUD, landing, results)
- **src/services/novitaApi.ts**: API layer for LLM calls (with timeout, retry, fallback)
- **src/hooks/useGame.ts**: Zustand-powered game state hook
- **src/data/players.ts**: LLM player definitions

---

## Game Flow
1. **Landing:** User enters API key, reviews rules, selects models.
2. **Arena:** LLMs receive prompts, submit actions, engine resolves turn, UI animates results.
3. **Results:** Champion crowned, standings shown, post-game interviews with LLMs.

---

## Security & Best Practices
- `.gitignore` excludes API keys, .env, and sensitive files (see .gitignore).
- No API keys or secrets are committed.
- All LLM API calls are client-side and require user-supplied keys.

---

## Development
- See PLAN.md for detailed architecture, phases, and decisions log.
- To run locally:
  1. `npm install`
  2. `npm run dev`
- Requires a Novita AI API key (not included).

---

## License
MIT (see LICENSE)
