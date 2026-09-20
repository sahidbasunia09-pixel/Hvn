import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

interface OpeningSceneProps {
  subStep: number;
  onAdvanceSubStep: (step: number) => void;
  onEnterMainWorld: () => void;
}

export const OpeningScene: React.FC<OpeningSceneProps> = ({
  subStep,
  onAdvanceSubStep,
  onEnterMainWorld,
}) => {
  // Automated cinematic timeline
  useEffect(() => {
    // Step 0: Dark screen with single glowing point
    const t1 = setTimeout(() => {
      onAdvanceSubStep(1); // Particles begin gathering
    }, 2800);

    // Step 2: "Something I Made For You…" appears
    const t2 = setTimeout(() => {
      onAdvanceSubStep(2);
    }, 6000);

    // Step 3: "From SAHID ❤️" appears
    const t3 = setTimeout(() => {
      onAdvanceSubStep(3);
    }, 9500);

    // Step 4: Button appears: "Enter My World →"
    const t4 = setTimeout(() => {
      onAdvanceSubStep(4);
    }, 12500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onAdvanceSubStep]);

  return (
    <div className="relative z-10 flex flex-col items-center justify-between min-h-screen w-full px-6 py-12 pointer-events-none select-none">
      {/* Top subtle badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: subStep >= 1 ? 0.75 : 0, y: subStep >= 1 ? 0 : -10 }}
        transition={{ duration: 1.5 }}
        className="flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-rose-200/60 font-cinzel"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        A Personal Creation
      </motion.div>

      {/* Center Cinematic Typography */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto space-y-6">
        {/* Step 0 Hint */}
        {subStep === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 2.6, repeat: Infinity }}
            className="text-xs tracking-[0.25em] uppercase text-rose-200/40 font-light"
          >
            In the quiet darkness, a light begins...
          </motion.p>
        )}

        {/* Text 1: “Something I Made For You…” */}
        <AnimatePresence>
          {subStep >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-cinzel font-light tracking-[0.08em] text-white text-glow-rose leading-tight">
                Something I Made <br />
                <span className="font-cormorant italic font-normal text-rose-300">
                  For You…
                </span>
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text 2: “From SAHID ❤️” */}
        <AnimatePresence>
          {subStep >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="flex items-center justify-center gap-3 pt-2"
            >
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
              <p className="text-sm sm:text-base tracking-[0.35em] uppercase font-cinzel text-rose-200/90 font-medium">
                From <span className="text-rose-400 font-bold">SAHID</span>{' '}
                <span className="inline-block text-rose-500 animate-pulse text-base align-middle">
                  ❤️
                </span>
              </p>
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button: “Enter My World →” */}
        <AnimatePresence>
          {subStep >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="pt-6 pointer-events-auto"
            >
              <button
                id="enter-my-world-button"
                onClick={onEnterMainWorld}
                className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 rounded-full glass-luxury text-rose-50 hover:text-white transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] cursor-pointer hover:shadow-[0_0_35px_rgba(244,63,94,0.4)] border border-rose-400/30 hover:border-rose-400/60"
              >
                {/* Subtle pulsing background glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-600/20 via-pink-500/20 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />

                <span className="text-xs sm:text-sm font-cinzel tracking-[0.25em] uppercase font-semibold">
                  Enter My World
                </span>
                <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom quick bypass if viewer wants to enter right away */}
      <div className="flex items-center justify-between w-full max-w-3xl pointer-events-auto text-[11px] text-rose-200/40 tracking-widest font-light">
        <span>Interactive 3D Letter</span>
        {subStep < 4 && (
          <button
            onClick={() => onAdvanceSubStep(4)}
            className="hover:text-rose-300 transition-colors uppercase tracking-[0.2em] cursor-pointer"
          >
            Skip Intro →
          </button>
        )}
        <span>Est. 2026</span>
      </div>
    </div>
  );
};
