import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SceneId, FloatingWord } from '../types';
import {
  createHeartGeometryHalves,
  createHeartMaterial,
  generateHeartSurfacePoints,
  generateTextParticleCoordinates,
} from '../utils/geometry';

interface OrbitNodeScreenPos {
  id: string;
  word: string;
  x: number;
  y: number;
  zDepth: number; // For z-index & scale
  opacity: number;
}

interface ThreeCanvasProps {
  currentScene: SceneId;
  openingSubStep: number; // 0: single particle, 1: gathering, 2+: formed
  emotionalSubStep: number; // 0 to 4
  onUpdateOrbitPositions?: (positions: OrbitNodeScreenPos[]) => void;
  isDraggingAllowed?: boolean;
}

export const ORBIT_WORDS: FloatingWord[] = [
  { id: 'care', word: 'CARE', angleOffset: 0, speed: 0.45, radius: 2.5, heightOffset: 0.4 },
  { id: 'respect', word: 'RESPECT', angleOffset: (Math.PI * 2) / 5, speed: 0.45, radius: 2.8, heightOffset: -0.3 },
  { id: 'trust', word: 'TRUST', angleOffset: ((Math.PI * 2) / 5) * 2, speed: 0.45, radius: 2.4, heightOffset: 0.5 },
  { id: 'feelings', word: 'FEELINGS', angleOffset: ((Math.PI * 2) / 5) * 3, speed: 0.45, radius: 2.7, heightOffset: -0.4 },
  { id: 'love', word: 'LOVE', angleOffset: ((Math.PI * 2) / 5) * 4, speed: 0.45, radius: 2.6, heightOffset: 0.2 },
];

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  currentScene,
  openingSubStep,
  emotionalSubStep,
  onUpdateOrbitPositions,
  isDraggingAllowed = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Object refs
  const heartGroupRef = useRef<THREE.Group | null>(null);
  const leftHalfMeshRef = useRef<THREE.Mesh | null>(null);
  const rightHalfMeshRef = useRef<THREE.Mesh | null>(null);
  const innerCoreMeshRef = useRef<THREE.Mesh | null>(null);
  const innerCoreLightRef = useRef<THREE.PointLight | null>(null);
  const movingSpotlightRef = useRef<THREE.PointLight | null>(null);

  // Particles
  const morphParticlesGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const morphParticlesMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const particleCurrentPositionsRef = useRef<Float32Array | null>(null);
  const particleRandomOriginsRef = useRef<Float32Array | null>(null);
  const particleHeartTargetsRef = useRef<Float32Array | null>(null);
  const particleTextTargetsRef = useRef<Float32Array | null>(null);

  // Interaction refs
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isDown: false });
  const animFrameIdRef = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());

  // Store latest props in ref for render loop
  const propsRef = useRef({
    currentScene,
    openingSubStep,
    emotionalSubStep,
    onUpdateOrbitPositions,
    isDraggingAllowed,
  });

  useEffect(() => {
    propsRef.current = {
      currentScene,
      openingSubStep,
      emotionalSubStep,
      onUpdateOrbitPositions,
      isDraggingAllowed,
    };
  }, [currentScene, openingSubStep, emotionalSubStep, onUpdateOrbitPositions, isDraggingAllowed]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Init Three Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050308, 0.045);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);
    cameraRef.current = camera;

    // 3. Renderer with high-end antialiasing and color management
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Rig
    // Ambient soft fill
    const ambientLight = new THREE.AmbientLight(0x28101a, 1.8);
    scene.add(ambientLight);

    // Dynamic front key light
    const keyLight = new THREE.DirectionalLight(0xfff1f2, 2.4);
    keyLight.position.set(3, 4, 6);
    scene.add(keyLight);

    // Warm rose rim light from behind
    const rimLight = new THREE.PointLight(0xf43f5e, 4.0, 15);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    // Soft moving light sweeping across the heart
    const sweepLight = new THREE.PointLight(0xffd5dc, 3.2, 8);
    sweepLight.position.set(0, 1, 2.5);
    scene.add(sweepLight);
    movingSpotlightRef.current = sweepLight;

    // Bottom bounce light
    const bounceLight = new THREE.PointLight(0xbe123c, 2.0, 10);
    bounceLight.position.set(0, -3, 2);
    scene.add(bounceLight);

    // 5. Build 3D Heart with split halves
    const heartGroup = new THREE.Group();
    const { leftGeometry, rightGeometry } = createHeartGeometryHalves();
    const heartMaterial = createHeartMaterial();

    const leftMesh = new THREE.Mesh(leftGeometry, heartMaterial);
    const rightMesh = new THREE.Mesh(rightGeometry, heartMaterial.clone());
    leftMesh.castShadow = true;
    leftMesh.receiveShadow = true;
    rightMesh.castShadow = true;
    rightMesh.receiveShadow = true;

    heartGroup.add(leftMesh);
    heartGroup.add(rightMesh);
    leftHalfMeshRef.current = leftMesh;
    rightHalfMeshRef.current = rightMesh;

    // Inner glowing core (hidden inside heart, emerges during emotional moment)
    const coreGeometry = new THREE.SphereGeometry(0.35, 32, 32);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xfb7185,
      emissiveIntensity: 3.5,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0,
    });
    const innerCoreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    innerCoreMesh.position.set(0, 0, 0);
    heartGroup.add(innerCoreMesh);
    innerCoreMeshRef.current = innerCoreMesh;

    // Light inside core
    const coreLight = new THREE.PointLight(0xfb7185, 0, 8);
    coreLight.position.set(0, 0, 0);
    heartGroup.add(coreLight);
    innerCoreLightRef.current = coreLight;

    heartGroup.position.set(0, 0, 0);
    scene.add(heartGroup);
    heartGroupRef.current = heartGroup;

    // 6. Particle Systems
    const PARTICLE_COUNT = 1400;

    // Generate positions:
    // A. Random wide galaxy distribution
    const randomPositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 6 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      randomPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      randomPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      randomPositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    particleRandomOriginsRef.current = randomPositions;

    // B. Heart surface positions
    const heartPositions = generateHeartSurfacePoints(PARTICLE_COUNT);
    particleHeartTargetsRef.current = heartPositions;

    // C. Text target positions ("You are special to me.")
    const textTargets = generateTextParticleCoordinates('You are special to me.', PARTICLE_COUNT);
    const textPositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      textPositions[i * 3] = textTargets[i].x;
      textPositions[i * 3 + 1] = textTargets[i].y;
      textPositions[i * 3 + 2] = textTargets[i].z;
    }
    particleTextTargetsRef.current = textPositions;

    // Current particle position buffer (starts with 1 single visible particle at origin if opening)
    const currentPositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      currentPositions[i] = randomPositions[i];
    }
    // Single glowing starter particle at index 0
    currentPositions[0] = 0;
    currentPositions[1] = 0;
    currentPositions[2] = 0;
    particleCurrentPositionsRef.current = currentPositions;

    // Particle geometry
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

    // Particle colors: soft rose, champagne gold, starlight white
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const c1 = new THREE.Color('#f43f5e');
    const c2 = new THREE.Color('#fbcfe8');
    const c3 = new THREE.Color('#fef08a');
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = Math.random();
      const col = r < 0.5 ? c1 : r < 0.85 ? c2 : c3;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    morphParticlesGeoRef.current = particleGeometry;

    // Create circular soft glowing point texture procedurally
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const pCtx = canvas.getContext('2d')!;
    const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 215, 230, 0.8)');
    grad.addColorStop(0.7, 'rgba(244, 63, 94, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 64, 64);
    const pointTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.16,
      map: pointTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85,
    });
    morphParticlesMaterialRef.current = particleMaterial;

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 7. Background Ambient Stardust (400 floating glass particles)
    const bgDustCount = 400;
    const bgDustGeo = new THREE.BufferGeometry();
    const bgDustPos = new Float32Array(bgDustCount * 3);
    for (let i = 0; i < bgDustCount; i++) {
      bgDustPos[i * 3] = (Math.random() - 0.5) * 26;
      bgDustPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      bgDustPos[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    bgDustGeo.setAttribute('position', new THREE.BufferAttribute(bgDustPos, 3));
    const bgDustMat = new THREE.PointsMaterial({
      size: 0.09,
      map: pointTexture,
      transparent: true,
      color: new THREE.Color(0xfbcfe8),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.45,
    });
    const bgDustSystem = new THREE.Points(bgDustGeo, bgDustMat);
    scene.add(bgDustSystem);

    // 8. Event Listeners for smooth mouse parallax
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 0.45;
      mouseRef.current.targetY = y * 0.35;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        mouseRef.current.targetX = x * 0.5;
        mouseRef.current.targetY = y * 0.4;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // 9. Resize Handling via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // 10. Animation Loop
    let particleConvergenceProgress = 0;
    let heartSplitProgress = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsedTime = clockRef.current.getElapsedTime();
      const {
        currentScene: sceneMode,
        openingSubStep: opStep,
        emotionalSubStep: emStep,
        onUpdateOrbitPositions: updateOrbit,
      } = propsRef.current;

      // Mouse lerp for cinematic smooth inertia
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Moving light sweep across the 3D heart surface
      if (movingSpotlightRef.current) {
        const sweepSpeed = 0.8;
        movingSpotlightRef.current.position.x = Math.sin(elapsedTime * sweepSpeed) * 2.8;
        movingSpotlightRef.current.position.y = Math.cos(elapsedTime * sweepSpeed * 0.7) * 1.5 + 0.5;
        movingSpotlightRef.current.position.z = 2.2 + Math.sin(elapsedTime * sweepSpeed * 1.2) * 0.6;
      }

      // Camera target position & lookAt based on current Scene
      const targetCamPos = new THREE.Vector3();
      const targetCamLook = new THREE.Vector3(0, 0, 0);

      if (sceneMode === 'OPENING') {
        targetCamPos.set(mouseRef.current.x * 0.8, mouseRef.current.y * 0.6, 7.5);
      } else if (sceneMode === 'MAIN') {
        targetCamPos.set(mouseRef.current.x * 1.2, 0.35 + mouseRef.current.y * 0.8, 5.8);
        targetCamLook.set(0, 0.1, 0);
      } else if (sceneMode === 'EMOTIONAL') {
        // Zoom closer for intimacy and glowing light core
        targetCamPos.set(mouseRef.current.x * 0.7, 0.25 + mouseRef.current.y * 0.5, 4.4);
        targetCamLook.set(0, 0.2, 0);
      } else if (sceneMode === 'FINAL') {
        // Slow cinematic dolly back to reveal vast stardust typography
        targetCamPos.set(mouseRef.current.x * 1.5, 0.8 + mouseRef.current.y * 1.0, 10.8);
        targetCamLook.set(0, 0.1, 0);
      }

      camera.position.lerp(targetCamPos, 0.04);
      camera.lookAt(targetCamLook);

      // --- Heart Rotation & Floating Bob ---
      if (heartGroupRef.current) {
        // Floating gentle breathing bob
        heartGroupRef.current.position.y = Math.sin(elapsedTime * 1.4) * 0.12;

        // Rotation
        if (sceneMode === 'OPENING') {
          // Faster rotation during particle gathering, then settles
          heartGroupRef.current.rotation.y += opStep >= 1 ? 0.007 : 0.003;
          heartGroupRef.current.rotation.x = Math.sin(elapsedTime * 0.7) * 0.05;
        } else if (sceneMode === 'MAIN') {
          heartGroupRef.current.rotation.y += 0.006;
          heartGroupRef.current.rotation.x = Math.sin(elapsedTime * 0.8) * 0.06;
        } else if (sceneMode === 'EMOTIONAL') {
          // Slows down rotation to reveal opening inside
          const targetRotY = Math.sin(elapsedTime * 0.3) * 0.15;
          heartGroupRef.current.rotation.y += (targetRotY - heartGroupRef.current.rotation.y) * 0.05;
          heartGroupRef.current.rotation.x = 0;
        } else if (sceneMode === 'FINAL') {
          heartGroupRef.current.rotation.y += 0.003;
          heartGroupRef.current.position.y = -0.5 + Math.sin(elapsedTime * 0.9) * 0.1;
        }
      }

      // --- Heart Splitting & Emotional Light Core ---
      if (leftHalfMeshRef.current && rightHalfMeshRef.current && innerCoreMeshRef.current && innerCoreLightRef.current) {
        const targetSplit = sceneMode === 'EMOTIONAL' && emStep >= 1 ? 1 : 0;
        heartSplitProgress += (targetSplit - heartSplitProgress) * 0.04;

        // Left half moves left and angles out
        leftHalfMeshRef.current.position.x = -heartSplitProgress * 0.95;
        leftHalfMeshRef.current.rotation.y = -heartSplitProgress * 0.35;
        leftHalfMeshRef.current.position.z = -heartSplitProgress * 0.2;

        // Right half moves right and angles out
        rightHalfMeshRef.current.position.x = heartSplitProgress * 0.95;
        rightHalfMeshRef.current.rotation.y = heartSplitProgress * 0.35;
        rightHalfMeshRef.current.position.z = -heartSplitProgress * 0.2;

        // Inner glowing core
        const coreMat = innerCoreMeshRef.current.material as THREE.MeshStandardMaterial;
        if (coreMat) {
          coreMat.opacity = heartSplitProgress * 0.95;
          coreMat.emissiveIntensity = 2.0 + Math.sin(elapsedTime * 4) * 0.8;
          innerCoreMeshRef.current.scale.setScalar(0.8 + heartSplitProgress * 0.4 + Math.sin(elapsedTime * 3) * 0.06);
          innerCoreMeshRef.current.position.z = heartSplitProgress * 0.4;
          innerCoreLightRef.current.intensity = heartSplitProgress * 4.5;
        }

        // Heart visibility transitions
        const leftMat = leftHalfMeshRef.current.material as THREE.MeshPhysicalMaterial;
        const rightMat = rightHalfMeshRef.current.material as THREE.MeshPhysicalMaterial;
        if (leftMat && rightMat) {
          if (sceneMode === 'OPENING') {
            // Invisible at step 0, gradually solidifies at step 1-2
            const targetOpacity = opStep === 0 ? 0 : opStep === 1 ? 0.35 : 0.96;
            leftMat.opacity += (targetOpacity - leftMat.opacity) * 0.05;
            rightMat.opacity = leftMat.opacity;
          } else if (sceneMode === 'FINAL') {
            // Fades into gentle translucent presence so particle text shines
            leftMat.opacity += (0.4 - leftMat.opacity) * 0.03;
            rightMat.opacity = leftMat.opacity;
          } else {
            leftMat.opacity += (0.96 - leftMat.opacity) * 0.05;
            rightMat.opacity = leftMat.opacity;
          }
        }
      }

      // --- Morphing Particle Animations ---
      if (
        morphParticlesGeoRef.current &&
        particleCurrentPositionsRef.current &&
        particleRandomOriginsRef.current &&
        particleHeartTargetsRef.current &&
        particleTextTargetsRef.current
      ) {
        const positions = particleCurrentPositionsRef.current;
        const posAttr = morphParticlesGeoRef.current.attributes.position as THREE.BufferAttribute;

        if (sceneMode === 'OPENING') {
          if (opStep === 0) {
            // Single glowing particle at center, others invisible / distant
            particleConvergenceProgress = 0;
            for (let i = 0; i < PARTICLE_COUNT; i++) {
              if (i === 0) {
                positions[0] = 0;
                positions[1] = Math.sin(elapsedTime * 2) * 0.05;
                positions[2] = 0;
              } else {
                // Keep far away
                positions[i * 3] = particleRandomOriginsRef.current[i * 3];
                positions[i * 3 + 1] = particleRandomOriginsRef.current[i * 3 + 1];
                positions[i * 3 + 2] = particleRandomOriginsRef.current[i * 3 + 2];
              }
            }
          } else {
            // Step 1+: Converge into 3D heart shape
            particleConvergenceProgress = Math.min(1, particleConvergenceProgress + 0.012);
            for (let i = 0; i < PARTICLE_COUNT; i++) {
              const targetX = particleHeartTargetsRef.current[i * 3];
              const targetY = particleHeartTargetsRef.current[i * 3 + 1];
              const targetZ = particleHeartTargetsRef.current[i * 3 + 2];

              // Smooth lerp with gentle swirl
              const speed = 0.03 + (i % 10) * 0.003;
              positions[i * 3] += (targetX - positions[i * 3]) * speed;
              positions[i * 3 + 1] += (targetY - positions[i * 3 + 1]) * speed;
              positions[i * 3 + 2] += (targetZ - positions[i * 3 + 2]) * speed;
            }
          }
        } else if (sceneMode === 'MAIN' || sceneMode === 'EMOTIONAL') {
          // Float gently around the 3D heart like glistening stardust aura
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const hx = particleHeartTargetsRef.current[i * 3];
            const hy = particleHeartTargetsRef.current[i * 3 + 1];
            const hz = particleHeartTargetsRef.current[i * 3 + 2];

            // Add gentle orbiting turbulence
            const angle = elapsedTime * 0.4 + i * 0.08;
            const flutter = Math.sin(elapsedTime * 1.5 + i) * 0.08;

            const targetX = hx * 1.15 + Math.cos(angle) * flutter;
            const targetY = hy * 1.15 + flutter;
            const targetZ = hz * 1.15 + Math.sin(angle) * flutter;

            positions[i * 3] += (targetX - positions[i * 3]) * 0.05;
            positions[i * 3 + 1] += (targetY - positions[i * 3 + 1]) * 0.05;
            positions[i * 3 + 2] += (targetZ - positions[i * 3 + 2]) * 0.05;
          }
        } else if (sceneMode === 'FINAL') {
          // Particles smoothly assemble to spell "You are special to me."
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const tx = particleTextTargetsRef.current[i * 3];
            const ty = particleTextTargetsRef.current[i * 3 + 1];
            const tz = particleTextTargetsRef.current[i * 3 + 2];

            const speed = 0.035 + (i % 7) * 0.004;
            positions[i * 3] += (tx - positions[i * 3]) * speed;
            positions[i * 3 + 1] += (ty - positions[i * 3 + 1]) * speed;
            positions[i * 3 + 2] += (tz - positions[i * 3 + 2]) * speed;
          }
        }

        posAttr.needsUpdate = true;
      }

      // Background stardust gentle drift
      if (bgDustSystem) {
        bgDustSystem.rotation.y = elapsedTime * 0.02;
        bgDustSystem.rotation.x = Math.sin(elapsedTime * 0.015) * 0.05;
      }

      // --- Project 3D Orbiting Words to Screen (CARE, RESPECT, TRUST, FEELINGS, LOVE) ---
      if (sceneMode === 'MAIN' && updateOrbit && container) {
        const orbitPositions: OrbitNodeScreenPos[] = [];
        const width = container.clientWidth;
        const height = container.clientHeight;

        ORBIT_WORDS.forEach((item) => {
          const angle = elapsedTime * item.speed + item.angleOffset;
          const worldPos = new THREE.Vector3(
            Math.cos(angle) * item.radius,
            item.heightOffset + Math.sin(elapsedTime * 0.8 + item.angleOffset) * 0.25,
            Math.sin(angle) * item.radius
          );

          // Clone and project into normalized device coordinates [-1, 1]
          const projected = worldPos.clone().project(camera);

          // Convert to container pixel coordinates
          const screenX = ((projected.x + 1) / 2) * width;
          const screenY = ((-projected.y + 1) / 2) * height;

          // Depth: positive Z in world space is closer to camera
          const zDepth = worldPos.z;
          // When behind heart (negative z), dim slightly
          const opacity = projected.z < 1 ? THREE.MathUtils.clamp(0.45 + (zDepth + item.radius) / (item.radius * 2) * 0.55, 0.35, 1.0) : 0;

          orbitPositions.push({
            id: item.id,
            word: item.word,
            x: screenX,
            y: screenY,
            zDepth,
            opacity,
          });
        });

        updateOrbit(orbitPositions);
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden pointer-events-auto"
      style={{ touchAction: 'none' }}
    />
  );
};
