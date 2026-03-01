import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import GameArena from './pages/GameArena';
import GameResults from './pages/GameResults';

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play/:gameId" element={<GameArena />} />
          <Route path="/results/:gameId" element={<GameResults />} />
          {/* Legacy routes redirect */}
          <Route path="/arena" element={<Navigate to="/play/battle-royale" replace />} />
          <Route path="/results" element={<Navigate to="/results/battle-royale" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
