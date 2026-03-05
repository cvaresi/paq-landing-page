export const COLORS = {
  magenta: '#CC1F8A',
  lightPink: '#E8A0C0',
  lime: '#9ACD32',
  darkGreen: '#2E6B2E',
  black: '#1A1A1A',
  background: '#FDF8F5',
} as const;

export const TIMING = {
  frameHoldSeconds: 3.5,
  transitionSeconds: 1.5,
  maxStaggerSeconds: 0.3,
} as const;

export const SCENE_CONSTANTS = {
  maxSpheres: 400,
  mobileSphereScale: 0.6, // ~40% reduction in count/visual density
  baseViewportWidth: 10, // logical width used for normalized positions
  idleDriftAmplitudeRatioMin: 0.02,
  idleDriftAmplitudeRatioMax: 0.04,
  idleDriftFreqMin: 0.3,
  idleDriftFreqMax: 0.8,
  ambientRotationSpeedDegPerSec: 0.3,
} as const;

export const LIGHTING = {
  ambientIntensity: 0.4,
  keyPointIntensity: 1.2,
  fillPointIntensity: 0.4,
  keyColor: 0xffffff,
  fillColor: 0xffccee,
} as const;

export const easeCubicInOut = (t: number) => {
  // Smoothstep-like cubic: t^3 * (t * (6t - 15) + 10)
  const tt = Math.max(0, Math.min(1, t));
  return tt * tt * tt * (tt * (tt * 6 - 15) + 10);
};

export const isStrictLayoutFrame = (frameIndex: number) =>
  frameIndex === 2 || frameIndex === 3 || frameIndex === 5; // Frames 3,4,6 (0-based)

