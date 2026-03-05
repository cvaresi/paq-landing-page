import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { FORMATIONS, MAX_SPHERES } from './formations';
import { SCENE_CONSTANTS, TIMING, easeCubicInOut } from './sceneConfig';

type Props = {
  frameIndex: number;
  sphereScale: number;
  isMobile: boolean;
};

const tempMatrix = new THREE.Matrix4();
const tempPosition = new THREE.Vector3();
const tempScale = new THREE.Vector3();
const tempColor = new THREE.Color();

type PoolState = {
  startPositions: Float32Array;
  targetPositions: Float32Array;
  currentScales: Float32Array;
  startScales: Float32Array;
  targetScales: Float32Array;
  squashFlags: Uint8Array;
  floatFlags: Uint8Array;
  idleAmpX: Float32Array;
  idleAmpY: Float32Array;
  idleFreqX: Float32Array;
  idleFreqY: Float32Array;
  idlePhase: Float32Array;
  floatPhase: Float32Array;
  stagger: Float32Array;
};

// #region agent log
const debugLog = (
  hypothesisId: string,
  message: string,
  data: Record<string, unknown>,
  runId = 'initial',
) => {
  fetch('http://127.0.0.1:7417/ingest/bb2268aa-fb4d-4d50-bb7d-d869e5355b36', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '2c7b64',
    },
    body: JSON.stringify({
      sessionId: '2c7b64',
      runId,
      hypothesisId,
      location: 'SpherePool.tsx:component',
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};
// #endregion

export const SpherePool: React.FC<Props> = ({ frameIndex, sphereScale, isMobile }) => {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const { clock } = useThree();

  const totalInstances = MAX_SPHERES;
  const maxVisible = isMobile
    ? Math.max(8, Math.floor(totalInstances * SCENE_CONSTANTS.mobileSphereScale))
    : totalInstances;

  const stateRef = useRef<PoolState | null>(null);
  if (!stateRef.current || stateRef.current.startPositions.length !== totalInstances * 3) {
    const count = totalInstances;
    stateRef.current = {
      startPositions: new Float32Array(count * 3),
      targetPositions: new Float32Array(count * 3),
      currentScales: new Float32Array(count),
      startScales: new Float32Array(count),
      targetScales: new Float32Array(count),
      squashFlags: new Uint8Array(count),
      floatFlags: new Uint8Array(count),
      idleAmpX: new Float32Array(count),
      idleAmpY: new Float32Array(count),
      idleFreqX: new Float32Array(count),
      idleFreqY: new Float32Array(count),
      idlePhase: new Float32Array(count),
      floatPhase: new Float32Array(count),
      stagger: new Float32Array(count),
    };
    debugLog('H1', 'PoolState initialized', { count }, 'initial');
  }
  const state = stateRef.current as PoolState;

  const animationStartTimeRef = useRef(0);
  const initializedRef = useRef(false);

  const formations = useMemo(() => FORMATIONS, []);

  // Update targets when frame changes
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const now = clock.getElapsedTime();
    const formation = formations[frameIndex];

    const {
      startPositions,
      targetPositions,
      currentScales,
      startScales,
      targetScales,
      squashFlags,
      floatFlags,
      idleAmpX,
      idleAmpY,
      idleFreqX,
      idleFreqY,
      idlePhase,
      floatPhase,
      stagger,
    } = state;

    const spheres = formation.spheres;
    const count = totalInstances;

    const ampMin = SCENE_CONSTANTS.idleDriftAmplitudeRatioMin;
    const ampMax = SCENE_CONSTANTS.idleDriftAmplitudeRatioMax;
    const freqMin = SCENE_CONSTANTS.idleDriftFreqMin;
    const freqMax = SCENE_CONSTANTS.idleDriftFreqMax;

    for (let i = 0; i < count; i += 1) {
      const s = spheres[i];
      const baseIndex = i * 3;

      const hasSphere = !!s && i < maxVisible;
      const radius = hasSphere ? s.radius : 0;
      const baseScale = radius * sphereScale;

      // Store current as start
      const cx = targetPositions[baseIndex];
      const cy = targetPositions[baseIndex + 1];
      const cz = targetPositions[baseIndex + 2];
      startPositions[baseIndex] = cx;
      startPositions[baseIndex + 1] = cy;
      startPositions[baseIndex + 2] = cz;
      startScales[i] = currentScales[i] || baseScale;

      if (hasSphere) {
        const [x, y, z] = s.position;
        targetPositions[baseIndex] = x * sphereScale;
        targetPositions[baseIndex + 1] = y * sphereScale;
        targetPositions[baseIndex + 2] = z * sphereScale;
        targetScales[i] = baseScale;

        squashFlags[i] = s.squash ? 1 : 0;
        floatFlags[i] = s.float ? 1 : 0;

        // Idle drift characteristics
        const ampRatio =
          ampMin + (ampMax - ampMin) * Math.random();
        idleAmpX[i] = ampRatio * radius * sphereScale;
        idleAmpY[i] = ampRatio * radius * sphereScale;
        idleFreqX[i] =
          freqMin + (freqMax - freqMin) * Math.random();
        idleFreqY[i] =
          freqMin + (freqMax - freqMin) * Math.random();
        idlePhase[i] = Math.random() * Math.PI * 2;

        floatPhase[i] = Math.random() * Math.PI * 2;
        stagger[i] = Math.random() * TIMING.maxStaggerSeconds;

        // Update colors
        tempColor.set(s.color);
        mesh.setColorAt(i, tempColor);
      } else {
        targetPositions[baseIndex] = 0;
        targetPositions[baseIndex + 1] = 0;
        targetPositions[baseIndex + 2] = -10;
        targetScales[i] = 0;

        squashFlags[i] = 0;
        floatFlags[i] = 0;
        stagger[i] = 0;
      }
    }

    mesh.instanceColor && (mesh.instanceColor.needsUpdate = true);

    if (!initializedRef.current) {
      // First frame: snap to targets
      for (let i = 0; i < count; i += 1) {
        currentScales[i] = targetScales[i];
        const baseIndex = i * 3;
        startPositions[baseIndex] = targetPositions[baseIndex];
        startPositions[baseIndex + 1] = targetPositions[baseIndex + 1];
        startPositions[baseIndex + 2] = targetPositions[baseIndex + 2];
      }
      initializedRef.current = true;
    }

    animationStartTimeRef.current = now;
    debugLog('H1', 'useEffect targets updated', { frameIndex }, 'initial');
  }, [clock, formations, frameIndex, maxVisible, sphereScale, stateRef, totalInstances]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || !initializedRef.current) return;

    const {
      startPositions,
      targetPositions,
      currentScales,
      startScales,
      targetScales,
      squashFlags,
      floatFlags,
      idleAmpX,
      idleAmpY,
      idleFreqX,
      idleFreqY,
      idlePhase,
      floatPhase,
      stagger,
    } = state;

    const now = clock.getElapsedTime();
    const elapsed = now - animationStartTimeRef.current;
    const duration = TIMING.transitionSeconds;

    for (let i = 0; i < totalInstances; i += 1) {
      const baseIndex = i * 3;

      // Handle mobile density
      if (i >= maxVisible) {
        tempPosition.set(0, 0, -10);
        tempScale.setScalar(0);
        tempMatrix.compose(tempPosition, new THREE.Quaternion(), tempScale);
        mesh.setMatrixAt(i, tempMatrix);
        continue;
      }

      const tSphere = Math.min(
        1,
        Math.max(0, (elapsed - stagger[i]) / duration),
      );
      const eased = easeCubicInOut(tSphere);

      const sx = startPositions[baseIndex];
      const sy = startPositions[baseIndex + 1];
      const sz = startPositions[baseIndex + 2];
      const tx = targetPositions[baseIndex];
      const ty = targetPositions[baseIndex + 1];
      const tz = targetPositions[baseIndex + 2];

      // Interpolated base position
      const bx = sx + (tx - sx) * eased;
      const by = sy + (ty - sy) * eased;
      const bz = sz + (tz - sz) * eased;

      const ss = startScales[i];
      const ts = targetScales[i];
      const baseScale = ss + (ts - ss) * eased;
      currentScales[i] = baseScale;

      // Idle drift blend out + back in around transition
      let idleBlend = 1;
      if (tSphere > 0 && tSphere < 1) {
        const mid = Math.abs(tSphere - 0.5) / 0.5; // 1 at ends, 0 at middle
        idleBlend = easeCubicInOut(mid);
      }

      const t = now;
      const dx =
        Math.sin(idleFreqX[i] * t + idlePhase[i]) *
        idleAmpX[i] *
        idleBlend;
      const dy =
        Math.cos(idleFreqY[i] * t + idlePhase[i]) *
        idleAmpY[i] *
        idleBlend;

      let px = bx + dx;
      let py = by + dy;
      let pz = bz;

      // Floating spheres (Frame 7)
      if (floatFlags[i]) {
        const floatOffset =
          Math.sin(t * 1.2 + floatPhase[i]) * 0.25;
        py += floatOffset;
      }

      tempPosition.set(px, py, pz);

      // Squash/stretch (Frame 4)
      if (squashFlags[i]) {
        tempScale.set(
          baseScale * 1.4,
          baseScale * 0.45,
          baseScale * 1.2,
        );
      } else {
        tempScale.setScalar(baseScale);
      }

      tempMatrix.compose(
        tempPosition,
        new THREE.Quaternion(),
        tempScale,
      );
      mesh.setMatrixAt(i, tempMatrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined as any, undefined as any, totalInstances]}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        metalness={0.5}
        roughness={0.15}
        envMapIntensity={1}
      />
    </instancedMesh>
  );
};

export default SpherePool;

