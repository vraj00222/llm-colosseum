import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../hooks/useGame';

export default function ApiKeyInput() {
  const { apiKey, setApiKey } = useGame();
  const [show, setShow] = useState(false);

  return (
    <motion.div
      className="max-w-lg mx-auto px-6 py-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <label className="block font-pixel text-xs text-gray-400 mb-3 text-center">
        {'\u{1F511}'} Novita AI API Key
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk_..."
          className="w-full bg-arena-dark border border-arena-border rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-arena-accent transition-colors"
        />
        <button
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs font-mono"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      <p className="font-mono text-xs text-gray-600 mt-2 text-center">
        Stored in localStorage. Never sent anywhere except Novita AI.
      </p>
    </motion.div>
  );
}
