import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Arena from './pages/Arena';
import Results from './pages/Results';

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
