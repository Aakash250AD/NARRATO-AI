
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
}

// ─── Particle ────────────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  drift: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.6 + 0.1,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 4,
    drift: (Math.random() - 0.5) * 40,
  }));
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 55, startDelay = 1600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let idx = 0;
    setDisplayed('');
    setDone(false);

    const start = setTimeout(() => {
      const interval = setInterval(() => {
        idx++;
        setDisplayed(text.slice(0, idx));
        if (idx >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(start);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// ─── Main Component ───────────────────────────────────────────────────────────
const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [particles] = useState(() => generateParticles(80));
  const { displayed, done: typeDone } = useTypewriter('Transform data into intelligence.', 55, 1800);

  // Phase timeline: 0.8s fade-in → hold → 3.8s auto-exit
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 800);
    const t2 = setTimeout(() => setPhase('out'), 3800);
    const t3 = setTimeout(() => onComplete(), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'out' ? (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#030000' }}
        >
          {/* ── Deep ambient glows ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(180,10,10,0.18) 0%, transparent 70%), ' +
                'radial-gradient(ellipse 40% 30% at 20% 80%, rgba(120,0,0,0.10) 0%, transparent 70%)',
            }}
          />

          {/* ── Particles ── */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-red-500"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  opacity: p.opacity,
                }}
                animate={{
                  y: [0, p.drift, 0],
                  opacity: [p.opacity, p.opacity * 0.3, p.opacity],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* ── Horizontal scan line ── */}
          <motion.div
            className="absolute left-0 right-0 h-px pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.6) 30%, rgba(255,80,80,0.9) 50%, rgba(220,38,38,0.6) 70%, transparent 100%)',
              boxShadow: '0 0 18px 4px rgba(220,38,38,0.35)',
            }}
            animate={{ top: ['-2%', '102%'] }}
            transition={{ duration: 2.4, ease: 'linear', repeat: Infinity, repeatDelay: 1.2 }}
          />

          {/* ── Grid overlay ── */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(220,38,38,1) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* ── Core content ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative flex flex-col items-center gap-8 z-10"
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 180,
                height: 180,
                background: 'radial-gradient(circle, rgba(220,38,38,0.25) 0%, transparent 70%)',
                filter: 'blur(20px)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Logo icon */}
            <motion.div
              className="relative w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 60%, #ef4444 100%)',
                boxShadow: '0 0 60px rgba(220,38,38,0.5), 0 0 120px rgba(220,38,38,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
              animate={{
                boxShadow: [
                  '0 0 40px rgba(220,38,38,0.4), 0 0 80px rgba(220,38,38,0.15)',
                  '0 0 70px rgba(220,38,38,0.7), 0 0 140px rgba(220,38,38,0.3)',
                  '0 0 40px rgba(220,38,38,0.4), 0 0 80px rgba(220,38,38,0.15)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Zap className="text-white" size={48} fill="currentColor" />
            </motion.div>

            {/* App name */}
            <div className="flex flex-col items-center gap-3">
              <motion.h1
                className="text-6xl font-black tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fca5a5 50%, #dc2626 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                  letterSpacing: '-0.02em',
                }}
                initial={{ opacity: 0, letterSpacing: '0.3em' }}
                animate={{ opacity: 1, letterSpacing: '-0.02em' }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                NarratoAI
              </motion.h1>

              {/* Tagline typewriter */}
              <div className="h-7 flex items-center">
                <p className="text-base text-gray-400 font-mono tracking-widest uppercase">
                  {displayed}
                  {!typeDone && (
                    <motion.span
                      className="inline-block w-0.5 h-4 bg-red-500 ml-0.5 align-middle"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </p>
              </div>
            </div>

            {/* Divider line */}
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-red-700/50 to-transparent"
              initial={{ width: 0 }}
              animate={{ width: 320 }}
              transition={{ duration: 1.2, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Loading bar */}
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              <div
                className="w-64 h-0.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(220,38,38,0.1)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #dc2626, #ef4444, #dc2626)',
                    boxShadow: '0 0 10px rgba(220,38,38,0.8)',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.2, delay: 1.5, ease: 'easeInOut' }}
                />
              </div>
              <motion.p
                className="text-[10px] font-bold tracking-[0.3em] uppercase"
                style={{ color: 'rgba(220,38,38,0.5)' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                Initializing AI Engine
              </motion.p>
            </motion.div>
          </motion.div>

          {/* ── Corner decorations ── */}
          {[
            { top: 24, left: 24, rotate: 0 },
            { top: 24, right: 24, rotate: 90 },
            { bottom: 24, left: 24, rotate: 270 },
            { bottom: 24, right: 24, rotate: 180 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-8 h-8 pointer-events-none"
              style={{
                ...pos,
                borderColor: 'rgba(220,38,38,0.3)',
                borderTopWidth: 2,
                borderLeftWidth: 2,
                borderStyle: 'solid',
                transform: `rotate(${pos.rotate}deg)`,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
            />
          ))}

          {/* ── Version badge ── */}
          <motion.div
            className="absolute bottom-8 text-[10px] font-mono tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.1)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            v2.0 · Powered by Gemini
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default CinematicIntro;
