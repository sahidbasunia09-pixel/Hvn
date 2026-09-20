import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface OrbitNodeScreenPos {
  id: string;
  word: string;
  x: number;
  y: number;
  zDepth: number;
  opacity: number;
}

interface OrbitingWordsOverlayProps {
  nodes: OrbitNodeScreenPos[];
  isVisible: boolean;
}

const WORD_WHISPERS: Record<string, string> = {
  care: 'I want to protect your peace and smile every single day.',
  respect: 'Your choices, your thoughts, your heart—I respect them above all.',
  trust: 'Unconditional, honest, and steadfast through all seasons.',
  feelings: 'Deep, quiet, and real—more than words could ever convey.',
  love: 'Pure, patient, and asking for nothing except your happiness.',
};

export const OrbitingWordsOverlay: React.FC<OrbitingWordsOverlayProps> = ({
  nodes,
  isVisible,
}) => {
  const [activeHoverWord, setActiveHoverWord] = useState<string | null>(null);

  if (!isVisible || nodes.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {nodes.map((node) => {
        // Calculate scale based on z-depth
        const scale = Math.max(0.75, Math.min(1.15, 0.95 + node.zDepth * 0.08));
        const zIndex = Math.round((node.zDepth + 5) * 10);
        const isHovered = activeHoverWord === node.id;

        return (
          <div
            key={node.id}
            style={{
              transform: `translate3d(${node.x}px, ${node.y}px, 0) translate(-50%, -50%) scale(${scale})`,
              zIndex,
              opacity: node.opacity,
            }}
            className="absolute top-0 left-0 transition-opacity duration-300 pointer-events-auto"
          >
            <div
              onMouseEnter={() => setActiveHoverWord(node.id)}
              onMouseLeave={() => setActiveHoverWord(null)}
              className={`group relative cursor-pointer px-4 py-1.5 rounded-full glass-pill transition-all duration-300 flex items-center gap-1.5 ${
                isHovered
                  ? 'border-rose-400/70 shadow-[0_0_20px_rgba(244,63,94,0.5)] scale-110'
                  : 'hover:border-rose-400/40'
              }`}
            >
              <span className="w-1 h-1 rounded-full bg-rose-400 group-hover:scale-150 transition-transform" />
              <span className="font-cinzel text-[10px] sm:text-xs tracking-[0.25em] uppercase font-semibold text-rose-100 group-hover:text-white">
                {node.word}
              </span>

              {/* Hover Whisper Tooltip */}
              <AnimatePresence>
                {isHovered && WORD_WHISPERS[node.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.92 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2.5 rounded-xl glass-luxury text-center z-50 pointer-events-none border border-rose-300/20"
                  >
                    <p className="font-cormorant italic text-xs text-rose-100/90 leading-snug">
                      “{WORD_WHISPERS[node.id]}”
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
};
