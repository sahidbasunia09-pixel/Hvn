import React from 'react';
import { Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';
import { SceneId } from '../types';

interface ControlsHeaderProps {
  currentScene: SceneId;
  onSelectScene: (scene: SceneId) => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
}

export const ControlsHeader: React.FC<ControlsHeaderProps> = ({
  currentScene,
  onSelectScene,
  isAudioPlaying,
  onToggleAudio,
}) => {
  const scenes: { id: SceneId; label: string }[] = [
    { id: 'OPENING', label: 'Prologue' },
    { id: 'MAIN', label: 'The Heart' },
    { id: 'EMOTIONAL', label: 'Inner Soul' },
    { id: 'FINAL', label: 'Starlight' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 py-4 pointer-events-none select-none">
      {/* Brand & Creator Signature */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]" />
          <span className="font-cinzel text-xs sm:text-sm tracking-[0.25em] uppercase text-white font-medium">
            Made For You <span className="text-rose-500">❤️</span>
          </span>
        </div>
        <span className="hidden sm:inline text-[10px] tracking-[0.25em] uppercase text-rose-300/40 font-cinzel">
          • by SAHID
        </span>
      </div>

      {/* Navigation Scene Indicators */}
      <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full glass-luxury-subtle pointer-events-auto border border-rose-300/10">
        {scenes.map((s) => {
          const isActive = currentScene === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectScene(s.id)}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-cinzel tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-rose-600/60 text-white font-semibold shadow-[0_0_12px_rgba(225,29,72,0.4)] border border-rose-400/30'
                  : 'text-rose-200/50 hover:text-rose-200 hover:bg-rose-500/10'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Ambient Sound Toggle */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <button
          onClick={onToggleAudio}
          title={isAudioPlaying ? 'Mute Ethereal Ambience' : 'Play Ethereal Ambience'}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full glass-luxury-subtle hover:glass-luxury transition-all text-rose-200 hover:text-white cursor-pointer border border-rose-300/15"
        >
          {isAudioPlaying ? (
            <>
              <div className="flex items-end gap-[2px] h-3.5">
                <span className="w-[2px] bg-rose-400 animate-[bounce_0.8s_infinite] h-2" />
                <span className="w-[2px] bg-rose-400 animate-[bounce_1.1s_infinite] h-3.5" />
                <span className="w-[2px] bg-rose-400 animate-[bounce_0.9s_infinite] h-1.5" />
                <span className="w-[2px] bg-rose-400 animate-[bounce_1.3s_infinite] h-3" />
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-cinzel text-rose-300/80">
                Music
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-300/50 group-hover:text-rose-200 transition-colors" />
              <span className="text-[10px] tracking-[0.2em] uppercase font-cinzel text-rose-300/50 group-hover:text-rose-200">
                Sound On
              </span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
