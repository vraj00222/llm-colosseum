import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <motion.div
      className="text-center py-20 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(rgba(108,92,231,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <motion.div
        className="relative z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
      >
        <h1 className="font-pixel text-4xl md:text-5xl text-white mb-4 leading-relaxed">
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            LLM{' '}
          </motion.span>
          <motion.span
            className="inline-block text-arena-accent"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            COLOSSEUM
          </motion.span>
        </h1>

        <motion.p
          className="font-mono text-xl text-gray-400 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          "Release the Models"
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
