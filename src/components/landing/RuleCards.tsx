import { motion } from 'framer-motion';

const rules = [
  {
    title: '6 AIs Enter',
    description: 'Six different LLM models are dropped into a 2D battle arena. Each with unique strengths and personalities.',
  },
  {
    title: 'Same Prompt',
    description: 'Every model gets the same game state. They see nearby players, resources, and recent events. Fair fight.',
  },
  {
    title: 'You Just Watch',
    description: 'This is a spectator game. The AIs decide everything — alliances, betrayals, trash talk. You enjoy the show.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { y: 60, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
  },
};

export default function RuleCards() {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
    >
      {rules.map((rule, i) => (
        <motion.div
          key={i}
          variants={item}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-arena-panel border border-arena-border rounded-xl p-8 text-center cursor-default"
        >
          <h3 className="font-pixel text-sm text-arena-accent mb-3">{rule.title}</h3>
          <p className="font-mono text-sm text-gray-400 leading-relaxed">{rule.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
