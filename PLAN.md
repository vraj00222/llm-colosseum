# LLM Colosseum - Development Plan

## Architecture

- [x] Tech stack: Vite + React 18 + TypeScript + Tailwind CSS + Framer Motion + Zustand
- [x] File/folder structure created per spec
- [x] Component tree: App > Router > {Home, Arena, Results}
- [x] API integration: direct client-side calls to Novita AI
- [x] State management: Zustand store (useGame hook)

## Phase 1: Project Setup & Landing Page

- [x] Vite + React + TypeScript scaffold
- [x] Install dependencies (framer-motion, zustand, react-router-dom, tailwindcss)
- [x] Landing page with Hero, RuleCards, FighterShowcase, ApiKeyInput
- [x] Route setup (home -> arena -> results)
- [x] TEST: App runs, landing page renders

## Phase 2: Game Engine (Core Logic)

- [x] Grid/map system (15x15 tile map with procedural generation)
- [x] Player state management (Zustand store)
- [x] Turn loop system (async, all models move simultaneously)
- [x] Action parsing & validation with fallback
- [x] Combat/interaction resolution (6-phase resolution order)
- [x] Resource system (gather wood/stone/berries/water, craft sword/potion)
- [x] TEST: Engine compiles and type-checks

## Phase 3: Novita AI API Integration

- [x] API service layer with timeout, retry, fallback
- [x] Prompt construction per player per round
- [x] Response parsing with fallback to random action
- [x] Rate limiting / concurrent request handling (Promise.all)
- [x] Post-game interview API calls

## Phase 4: Game UI - The Arena

- [x] 15x15 grid with pixel tile rendering
- [x] Animated player sprites (colored circles with emojis)
- [x] Tile types (grass, water, tree, rock, bush)
- [x] Smooth movement animations (framer-motion spring)
- [x] Alliance lines between allied players

## Phase 5: HUD & Panels

- [x] Player status cards (HP bars, inventory, alive/dead)
- [x] Live event log (scrolling, color-coded)
- [x] Broadcast panel (model messages)
- [x] Round counter + game phase
- [x] Speed control (0.5x, 1x, 2x)
- [x] Elimination banner with dramatic animation

## Phase 6: Game Flow & Polish

- [x] Death animations & elimination banners
- [x] Post-game interview (API calls to eliminated models)
- [x] Victory screen with champion + standings
- [x] Results page with Champion, Standings, PostGameInterview

## Phase 7: Landing Page Polish & Final

- [x] Framer-motion page transitions (AnimatePresence)
- [x] Staggered card animations
- [x] Button hover/tap animations
- [x] Loading states

## Known Issues

(track bugs here as they arise)

## Decisions Log

- Using Tailwind CSS v4 with @tailwindcss/vite plugin
- Models: DeepSeek V3.2, Qwen 3.5 397B, Kimi K2.5, GLM-5, MiniMax M2.5, Qwen3 Coder 480B
- Disabled verbatimModuleSyntax in tsconfig for simpler imports
