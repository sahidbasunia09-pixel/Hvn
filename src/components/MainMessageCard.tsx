import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, ChevronDown, ChevronUp, Languages, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface MainMessageCardProps {
  onProceedToEmotionalMoment: () => void;
}

export const MainMessageCard: React.FC<MainMessageCardProps> = ({
  onProceedToEmotionalMoment,
}) => {
  const [showEnglishTranslation, setShowEnglishTranslation] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="relative z-20 w-full max-w-xl mx-auto px-4 sm:px-6 pointer-events-none select-none">
      {/* Minimized Quick Button if user wants to freely view the 3D heart & orbiting words */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="flex flex-col items-center gap-3 pointer-events-auto"
          >
            <button
              onClick={() => setIsMinimized(false)}
              className="glass-luxury px-6 py-3 rounded-full text-xs font-cinzel tracking-[0.25em] text-rose-200 uppercase flex items-center gap-2 hover:text-white hover:border-rose-400/50 transition-all cursor-pointer shadow-lg hover:shadow-rose-900/30"
            >
              <Eye className="w-3.5 h-3.5 text-rose-400" />
              Read The Letter
            </button>
            <p className="text-[11px] text-rose-200/50 tracking-wider font-light">
              Drag to gently orbit the 3D heart
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Luxury Glass Card */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.96 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-luxury rounded-2xl sm:rounded-3xl p-6 sm:p-9 relative pointer-events-auto border border-rose-300/15 overflow-hidden"
          >
            {/* Top decorative accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-rose-500/70 to-transparent" />

            {/* Header with Title & Minimizer */}
            <div className="flex items-center justify-between border-b border-rose-300/10 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-full bg-rose-500/15 text-rose-400">
                  <Heart className="w-3.5 h-3.5 fill-rose-500/40" />
                </span>
                <div>
                  <h2 className="font-cinzel text-base sm:text-lg tracking-[0.18em] text-white uppercase font-medium">
                    I Made This For You
                  </h2>
                  <p className="text-[10px] sm:text-[11px] font-cinzel tracking-[0.25em] text-rose-300/60 uppercase">
                    Personal Digital Letter
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowEnglishTranslation(!showEnglishTranslation)}
                  title="Toggle Bengali / English"
                  className="p-2 rounded-full hover:bg-rose-500/15 text-rose-300/70 hover:text-rose-200 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px] tracking-wider uppercase font-cinzel">
                    {showEnglishTranslation ? 'বাংলা' : 'EN'}
                  </span>
                </button>

                <button
                  onClick={() => setIsMinimized(true)}
                  title="Minimize to view 3D Heart"
                  className="p-2 rounded-full hover:bg-rose-500/15 text-rose-300/70 hover:text-rose-200 transition-colors cursor-pointer"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Poetic Bengali Message */}
            <div className="space-y-6 my-2">
              {/* Paragraph 1 */}
              <div className="relative pl-4 border-l-2 border-rose-500/40">
                <p className="font-bengali text-lg sm:text-xl text-rose-50/95 leading-relaxed tracking-wide font-normal">
                  «“তোমার জন্য এই ছোট্ট পৃথিবীটা আমি নিজে তৈরি করেছি। কারণ তোমাকে নিয়ে আমার অনুভূতিটা শুধু কয়েকটা সাধারণ কথায় প্রকাশ করা আমার কাছে সম্ভব নয়।”»
                </p>
                {showEnglishTranslation && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 0.8, height: 'auto' }}
                    className="text-xs sm:text-sm font-cormorant italic text-rose-200/80 pt-2 leading-relaxed"
                  >
                    “I created this little world for you with my own hands. Because the depth of what I feel for you could never be contained in ordinary words.”
                  </motion.p>
                )}
              </div>

              {/* Paragraph 2 */}
              <div className="relative pl-4 border-l-2 border-rose-500/40">
                <p className="font-bengali text-lg sm:text-xl text-rose-50/95 leading-relaxed tracking-wide font-normal">
                  «“আমি তোমাকে সত্যিই অনেক ভালোবাসি। তোমাকে কোনো চাপ দেওয়ার জন্য নয়—শুধু চেয়েছি তুমি আমার মনের কথাটা একবার জানতে পারো।”»
                </p>
                {showEnglishTranslation && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 0.8, height: 'auto' }}
                    className="text-xs sm:text-sm font-cormorant italic text-rose-200/80 pt-2 leading-relaxed"
                  >
                    “I truly love you from the depths of my heart. Not to put any burden or pressure upon you—only because I wished for you to know what is in my heart.”
                  </motion.p>
                )}
              </div>
            </div>

            {/* Signature & Next Action */}
            <div className="pt-6 mt-6 border-t border-rose-300/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs tracking-[0.25em] text-rose-300/60 uppercase font-cinzel">
                  With all my sincerity,
                </span>
                <span className="font-cinzel font-bold text-sm tracking-[0.2em] text-white">
                  SAHID
                </span>
                <span className="text-rose-500 text-xs">❤️</span>
              </div>

              <button
                id="reveal-inside-heart-button"
                onClick={onProceedToEmotionalMoment}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-cinzel tracking-[0.2em] uppercase font-medium shadow-md shadow-rose-900/40 hover:shadow-rose-700/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-rose-300/30"
              >
                <span>Look Inside</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
