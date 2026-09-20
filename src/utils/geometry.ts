import * as THREE from 'three';
import { TextParticleTarget } from '../types';

/**
 * Creates left and right halves of a luxury 3D sculpted heart
 * so they can seamlessly sit together and part open in the cinematic scene.
 */
export function createHeartGeometryHalves(): {
  leftGeometry: THREE.BufferGeometry;
  rightGeometry: THREE.BufferGeometry;
} {
  // Left half shape
  const leftShape = new THREE.Shape();
  leftShape.moveTo(0, -1.3);
  leftShape.bezierCurveTo(-0.7, -0.6, -1.45, 0.1, -1.45, 0.8);
  leftShape.bezierCurveTo(-1.45, 1.45, -0.75, 1.55, -0.1, 1.15);
  leftShape.lineTo(0, 0.95);
  leftShape.lineTo(0, -1.3);

  // Right half shape
  const rightShape = new THREE.Shape();
  rightShape.moveTo(0, -1.3);
  rightShape.bezierCurveTo(0.7, -0.6, 1.45, 0.1, 1.45, 0.8);
  rightShape.bezierCurveTo(1.45, 1.45, 0.75, 1.55, 0.1, 1.15);
  rightShape.lineTo(0, 0.95);
  rightShape.lineTo(0, -1.3);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 2,
    depth: 0.35,
    bevelEnabled: true,
    bevelThickness: 0.35,
    bevelSize: 0.3,
    bevelOffset: -0.05,
    bevelSegments: 16,
    curveSegments: 32,
  };

  const leftGeo = new THREE.ExtrudeGeometry(leftShape, extrudeSettings);
  const rightGeo = new THREE.ExtrudeGeometry(rightShape, extrudeSettings);

  // Center depth
  leftGeo.center();
  rightGeo.center();

  // Offset slightly so their inner edges align at x=0
  leftGeo.translate(-0.46, 0, 0);
  rightGeo.translate(0.46, 0, 0);

  return {
    leftGeometry: leftGeo,
    rightGeometry: rightGeo,
  };
}

/**
 * Creates luxury ruby crystal physical material
 */
export function createHeartMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#be123c'), // Ruby Crimson
    emissive: new THREE.Color('#4c0519'),
    emissiveIntensity: 0.45,
    roughness: 0.18,
    metalness: 0.12,
    transmission: 0.65, // Glass/crystal refraction
    ior: 1.52,
    thickness: 1.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.9,
    transparent: true,
    opacity: 0.96,
  });
}

/**
 * Generates 3D surface points in the mathematical shape of a heart
 */
export function generateHeartSurfacePoints(count: number): Float32Array {
  const points = new Float32Array(count * 3);
  let idx = 0;

  for (let i = 0; i < count; i++) {
    // Parametric heart formula
    const t = Math.PI * (Math.random() * 2 - 1);
    const phi = Math.PI * (Math.random() - 0.5);

    // Core heart parametric
    const sinT = Math.sin(t);
    const cosT = Math.cos(t);
    const cosPhi = Math.cos(phi);

    const x = 16 * Math.pow(sinT, 3) * cosPhi;
    const y =
      (13 * cosT - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) *
      cosPhi;
    const z = 7 * Math.sin(phi);

    // Scale to scene dimensions
    const scale = 0.14 + (Math.random() - 0.5) * 0.02;
    points[idx] = x * scale;
    points[idx + 1] = y * scale + 0.15;
    points[idx + 2] = z * scale;
    idx += 3;
  }

  return points;
}

/**
 * Rasterizes text onto an offscreen canvas and samples coordinate points in 3D
 * for the final scene particle transformation.
 */
export function generateTextParticleCoordinates(
  text: string,
  targetCount: number,
  width: number = 700,
  height: number = 200,
  scale: number = 0.025
): TextParticleTarget[] {
  if (typeof document === 'undefined') return [];

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 52px "Cinzel", "Montserrat", serif';
  ctx.fillText(text, width / 2, height / 2);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const validPixels: { x: number; y: number }[] = [];
  const step = 4; // Sample density

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      if (data[index] > 140) {
        validPixels.push({
          x: (x - width / 2) * scale,
          y: -(y - height / 2) * scale, // invert Y for 3D coordinates
        });
      }
    }
  }

  const targets: TextParticleTarget[] = [];
  for (let i = 0; i < targetCount; i++) {
    if (validPixels.length > 0) {
      const pixel = validPixels[i % validPixels.length];
      targets.push({
        x: pixel.x + (Math.random() - 0.5) * 0.05,
        y: pixel.y + (Math.random() - 0.5) * 0.05,
        z: (Math.random() - 0.5) * 0.2,
      });
    } else {
      targets.push({
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 2,
        z: 0,
      });
    }
  }

  return targets;
}
