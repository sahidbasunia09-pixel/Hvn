import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Heart, Eye, Sparkles, BookOpen } from 'lucide-react';

interface FinalSceneOverlayProps {
  onReplay: () => void;
  onJumpToScene: (scene: 'OPENING' | 'MAIN' | 'EMOTIONAL' | 'FINAL') => void;
}

export const FinalSceneOverlay: React.FC<FinalSceneOverlayProps> = ({
  onReplay,
  onJumpToScene,
}) => {
  const [subTextVisible, setSubTextVisible] = useState(false);
  const [signatureVisible, setSignatureVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setSubTextVisible(true);
    }, 2400);

    const t2 = setTimeout(() => {
      setSignatureVisible(true);
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative z-20 flex flex-col items-center justify-between min-h-screen w-full px-6 py-12 pointer-events-none select-none">
      {/* Top subtle emblem */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5 }}
        className="flex items-center gap-2 text-[11px] tracking-[0.35em] uppercase text-rose-200/60 font-cinzel"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        Written In The Constellation
      </motion.div>

      {/* Main Text Content */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto space-y-6 pt-12">
        {/* Primary Stardust text reflection */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3"
        >
          <p className="text-xs sm:text-sm font-cinzel tracking-[0.4em] uppercase text-rose-300/70 font-medium">
            Formed in Glowing Starlight
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-cinzel font-normal tracking-[0.1em] text-white text-glow-white leading-tight">
            “You are special to me.”
          </h1>
        </motion.div>

        {/* Then below: “Whatever you feel, I will respect it.” */}
        <AnimatePresence>
          {subTextVisible && (
            <motion.div
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.6 }}
              className="pt-4 max-w-lg"
            >
              <p className="text-lg sm:text-2xl font-cormorant italic text-rose-100/90 leading-relaxed font-normal">
                “Whatever you feel, I will respect it.”
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Signature: SAHID */}
        <AnimatePresence>
          {signatureVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4 }}
              className="pt-8 flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
                <span className="font-cinzel text-xl sm:text-2xl tracking-[0.35em] uppercase text-white font-bold text-glow-rose">
                  SAHID
                </span>
                <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
              </div>
              <p className="text-[10px] font-cinzel tracking-[0.3em] uppercase text-rose-300/50">
                Forever With Sincerity
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1 }}
        className="flex flex-wrap items-center justify-center gap-3 pointer-events-auto"
      >
        <button
          onClick={onReplay}
          className="glass-luxury px-5 py-2.5 rounded-full text-[11px] font-cinzel tracking-[0.2em] uppercase text-rose-200 hover:text-white flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-rose-300/20"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          Replay Journey
        </button>

        <button
          onClick={() => onJumpToScene('MAIN')}
          className="glass-luxury px-5 py-2.5 rounded-full text-[11px] font-cinzel tracking-[0.2em] uppercase text-rose-200 hover:text-white flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-rose-300/20"
        >
          <BookOpen className="w-3.5 h-3.5 text-rose-400" />
          Read Letter Again
        </button>

        <button
          onClick={() => onJumpToScene('EMOTIONAL')}
          className="glass-luxury px-5 py-2.5 rounded-full text-[11px] font-cinzel tracking-[0.2em] uppercase text-rose-200 hover:text-white flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-rose-300/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          Inner Light
        </button>
      </motion.div>
    </div>
  );
};
