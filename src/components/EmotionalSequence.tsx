import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface EmotionalSequenceProps {
  subStep: number;
  onAdvanceSubStep: (step: number) => void;
  onProceedToFinalScene: () => void;
}

export const EmotionalSequence: React.FC<EmotionalSequenceProps> = ({
  subStep,
  onAdvanceSubStep,
  onProceedToFinalScene,
}) => {
  // Automated cinematic cadence
  useEffect(() => {
    // Step 0: Heart begins parting open, light emerges
    const t1 = setTimeout(() => {
      onAdvanceSubStep(1); // "My feelings are real."
    }, 2400);

    const t2 = setTimeout(() => {
      onAdvanceSubStep(2); // "My intention is honest."
    }, 6200);

    const t3 = setTimeout(() => {
      onAdvanceSubStep(3); // "And this was made only for you."
    }, 10200);

    const t4 = setTimeout(() => {
      onAdvanceSubStep(4); // "— SAHID ❤️"
    }, 14000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onAdvanceSubStep]);

  return (
    <div className="relative z-20 flex flex-col items-center justify-between min-h-screen w-full px-6 py-12 pointer-events-none select-none">
      {/* Top subtle indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1 }}
        className="flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-rose-300/70 font-cinzel"
      >
        <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
        Inside The Heart
      </motion.div>

      {/* Cinematic Center Subtitles */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto space-y-6">
        {/* Line 1: “My feelings are real.” */}
        <AnimatePresence>
          {subStep >= 1 && (
            <motion.p
              initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.5 }}
              className="text-2xl sm:text-3xl md:text-4xl font-cormorant italic tracking-wide text-white text-glow-rose font-light"
            >
              “My feelings are real.”
            </motion.p>
          )}
        </AnimatePresence>

        {/* Line 2: “My intention is honest.” */}
        <AnimatePresence>
          {subStep >= 2 && (
            <motion.p
              initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-cormorant italic tracking-wide text-rose-100 text-glow-rose font-light"
            >
              “My intention is honest.”
            </motion.p>
          )}
        </AnimatePresence>

        {/* Line 3: “And this was made only for you.” */}
        <AnimatePresence>
          {subStep >= 3 && (
            <motion.p
              initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.6, delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl font-cormorant font-medium text-rose-200 text-glow-gold tracking-wide"
            >
              “And this was made only for you.”
            </motion.p>
          )}
        </AnimatePresence>

        {/* Line 4: “— SAHID ❤️” */}
        <AnimatePresence>
          {subStep >= 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.2 }}
              className="pt-4 flex items-center justify-center gap-3"
            >
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
              <span className="font-cinzel text-base sm:text-lg tracking-[0.3em] uppercase text-white font-semibold">
                — SAHID <span className="text-rose-500 animate-pulse">❤️</span>
              </span>
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue to Final Scene Button */}
        <AnimatePresence>
          {subStep >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="pt-8 pointer-events-auto"
            >
              <button
                id="see-stars-final-button"
                onClick={onProceedToFinalScene}
                className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 rounded-full glass-luxury text-rose-50 hover:text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-rose-400/40 hover:border-rose-400/70 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
              >
                <span className="text-xs font-cinzel tracking-[0.25em] uppercase font-semibold">
                  A Promise Across The Stars
                </span>
                <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle Step Dots */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {[1, 2, 3, 4].map((step) => (
          <button
            key={step}
            onClick={() => onAdvanceSubStep(step)}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              subStep >= step ? 'bg-rose-400 w-6' : 'bg-rose-900/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
