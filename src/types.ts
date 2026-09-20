export type SceneId = 'OPENING' | 'MAIN' | 'EMOTIONAL' | 'FINAL';

export interface FloatingWord {
  id: string;
  word: string;
  angleOffset: number;
  speed: number;
  radius: number;
  heightOffset: number;
}

export interface TextParticleTarget {
  x: number;
  y: number;
  z: number;
}

export interface AudioSettings {
  isPlaying: boolean;
  volume: number;
}
