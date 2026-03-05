import React, { useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import SpherePool from './SpherePool';
import TextOverlay from './TextOverlay';
import {
  COLORS,
  LIGHTING,
  SCENE_CONSTANTS,
  TIMING,
  isStrictLayoutFrame,
} from './sceneConfig';
import { FORMATIONS } from './formations';

type SceneProps = {
  frameIndex: number;
  isMobile: boolean;
};

const LQScene: React.FC<SceneProps> = ({ frameIndex, isMobile }) => {
  const groupRef = React.useRef<THREE.Group | null>(null);
  const { viewport } = useThree();

  const sphereScale = useMemo(
    () => viewport.width / SCENE_CONSTANTS.baseViewportWidth,
    [viewport.width],
  );

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    if (isStrictLayoutFrame(frameIndex)) return;

    const speedRad =
      (SCENE_CONSTANTS.ambientRotationSpeedDegPerSec * Math.PI) /
      180;
    group.rotation.y += speedRad * delta;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={LIGHTING.ambientIntensity} />
      <pointLight
        position={[6, 6, 6]}
        intensity={LIGHTING.keyPointIntensity}
        color={LIGHTING.keyColor}
      />
      <pointLight
        position={[-6, -4, 4]}
        intensity={LIGHTING.fillPointIntensity}
        color={LIGHTING.fillColor}
      />
      <SpherePool
        frameIndex={frameIndex}
        sphereScale={sphereScale}
        isMobile={isMobile}
      />
    </group>
  );
};

export const LQAnimation: React.FC = () => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media =
      typeof window !== 'undefined'
        ? window.matchMedia('(max-width: 768px)')
        : null;
    if (!media) return;

    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const frameCount = FORMATIONS.length;
    const totalDurationMs =
      (TIMING.frameHoldSeconds + TIMING.transitionSeconds) * 1000;

    let current = 0;
    const interval = window.setInterval(() => {
      current = (current + 1) % frameCount;
      setFrameIndex(current);
    }, totalDurationMs);

    return () => window.clearInterval(interval);
  }, []);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100vw',
    maxWidth: '100%',
    aspectRatio: '16 / 9',
    minHeight: 400,
    backgroundColor: COLORS.background,
    backgroundImage:
      'radial-gradient(circle at 10% 90%, rgba(255, 204, 238, 0.9), transparent 55%), radial-gradient(circle at 90% 10%, rgba(201, 248, 163, 0.9), transparent 55%)',
    overflow: 'hidden',
  };

  const canvasStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'block',
  };

  return (
    <div style={containerStyle}>
      <Canvas
        style={canvasStyle}
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['transparent']} />
        <LQScene frameIndex={frameIndex} isMobile={isMobile} />
      </Canvas>
      <TextOverlay frameIndex={frameIndex} isMobile={isMobile} />
    </div>
  );
};

export default LQAnimation;

