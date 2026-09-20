import React, { useState, useCallback } from 'react';
import { SceneId } from './types';
import { ThreeCanvas } from './components/ThreeCanvas';
import { OpeningScene } from './components/OpeningScene';
import { MainMessageCard } from './components/MainMessageCard';
import { EmotionalSequence } from './components/EmotionalSequence';
import { FinalSceneOverlay } from './components/FinalSceneOverlay';
import { ControlsHeader } from './components/ControlsHeader';
import { OrbitingWordsOverlay } from './components/OrbitingWordsOverlay';
import { ambientSound } from './audio/ambientSound';

interface OrbitNodeScreenPos {
  id: string;
  word: string;
  x: number;
  y: number;
  zDepth: number;
  opacity: number;
}

export default function App() {
  const [currentScene, setCurrentScene] = useState<SceneId>('OPENING');
  const [openingSubStep, setOpeningSubStep] = useState<number>(0);
  const [emotionalSubStep, setEmotionalSubStep] = useState<number>(0);
  const [orbitNodes, setOrbitNodes] = useState<OrbitNodeScreenPos[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Audio Toggle
  const handleToggleAudio = useCallback(() => {
    const newState = ambientSound.toggle();
    setIsAudioPlaying(newState);
  }, []);

  // Enter Main World from Opening Scene
  const handleEnterMainWorld = useCallback(() => {
    if (!isAudioPlaying) {
      ambientSound.start();
      setIsAudioPlaying(true);
    }
    setCurrentScene('MAIN');
  }, [isAudioPlaying]);

  // Proceed to Emotional Sequence
  const handleProceedToEmotionalMoment = useCallback(() => {
    setEmotionalSubStep(0);
    setCurrentScene('EMOTIONAL');
  }, []);

  // Proceed to Final Scene
  const handleProceedToFinalScene = useCallback(() => {
    setCurrentScene('FINAL');
  }, []);

  // Direct Scene Selection via Header
  const handleSelectScene = useCallback((scene: SceneId) => {
    if (scene === 'OPENING') {
      setOpeningSubStep(4); // Show formed ready state if jumped back
    } else if (scene === 'EMOTIONAL') {
      setEmotionalSubStep(4);
    }
    setCurrentScene(scene);
  }, []);

  // Full Replay from Beginning
  const handleReplay = useCallback(() => {
    setOpeningSubStep(0);
    setEmotionalSubStep(0);
    setCurrentScene('OPENING');
  }, []);

  const handleUpdateOrbitPositions = useCallback((positions: OrbitNodeScreenPos[]) => {
    setOrbitNodes(positions);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#050308] text-white select-none">
      {/* 3D WebGL Background Scene */}
      <ThreeCanvas
        currentScene={currentScene}
        openingSubStep={openingSubStep}
        emotionalSubStep={emotionalSubStep}
        onUpdateOrbitPositions={handleUpdateOrbitPositions}
      />

      {/* Orbiting 3D Glass Badges in Main Scene */}
      <OrbitingWordsOverlay
        nodes={orbitNodes}
        isVisible={currentScene === 'MAIN'}
      />

      {/* Cinematic Vignette & Ambient Color Grading */}
      <div className="cinematic-vignette absolute inset-0 z-10 pointer-events-none" />

      {/* Subtle Warm Rose Glow in Center Background */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rose-600/[0.04] blur-[120px] pointer-events-none -z-0"
        aria-hidden="true"
      />

      {/* Global Top Controls Header (Visible in all scenes, subtle) */}
      <ControlsHeader
        currentScene={currentScene}
        onSelectScene={handleSelectScene}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
      />

      {/* Scene Layer 1: Opening Scene */}
      {currentScene === 'OPENING' && (
        <OpeningScene
          subStep={openingSubStep}
          onAdvanceSubStep={setOpeningSubStep}
          onEnterMainWorld={handleEnterMainWorld}
        />
      )}

      {/* Scene Layer 2: Main 3D Scene with Glass Message Card */}
      {currentScene === 'MAIN' && (
        <div className="relative z-20 flex flex-col justify-end pb-8 sm:pb-12 min-h-screen w-full">
          <MainMessageCard
            onProceedToEmotionalMoment={handleProceedToEmotionalMoment}
          />
        </div>
      )}

      {/* Scene Layer 3: Emotional 3D Moment (Heart Opens + Core Emerges) */}
      {currentScene === 'EMOTIONAL' && (
        <EmotionalSequence
          subStep={emotionalSubStep}
          onAdvanceSubStep={setEmotionalSubStep}
          onProceedToFinalScene={handleProceedToFinalScene}
        />
      )}

      {/* Scene Layer 4: Final Scene (Stardust Formation + Promise) */}
      {currentScene === 'FINAL' && (
        <FinalSceneOverlay
          onReplay={handleReplay}
          onJumpToScene={handleSelectScene}
        />
      )}
    </main>
  );
}
