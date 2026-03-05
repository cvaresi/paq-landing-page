import { COLORS, SCENE_CONSTANTS } from './sceneConfig';

export type FormationSphere = {
  position: [number, number, number]; // normalized space, roughly -1..1 on X/Y
  radius: number;
  color: string;
  squash?: boolean;
  float?: boolean;
};

export type Formation = {
  id: number;
  spheres: FormationSphere[];
  ambientRotationAllowed: boolean;
};

const { maxSpheres } = SCENE_CONSTANTS;

const clampCount = (spheres: FormationSphere[]): FormationSphere[] =>
  spheres.slice(0, maxSpheres);

// Helper to create a scattered cloud within a region
const makeScatteredCloud = (count: number, xRange: [number, number], yRange: [number, number]) => {
  const colors = [COLORS.magenta, COLORS.lightPink, COLORS.lime, COLORS.darkGreen, COLORS.black];
  const spheres: FormationSphere[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = Math.random();
    const radius = 0.06 + Math.random() * 0.12;
    const x = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
    const y = yRange[0] + Math.random() * (yRange[1] - yRange[0]);
    const z = -0.3 + Math.random() * 0.6;
    spheres.push({
      position: [x, y, z],
      radius,
      color: colors[Math.floor(t * colors.length)],
    });
  }
  return spheres;
};

// Frame 1: Scattered Cloud
const frame1: Formation = {
  id: 0,
  spheres: clampCount(makeScatteredCloud(50, [-1.4, -0.1], [-0.7, 0.7])),
  ambientRotationAllowed: true,
};

// Frame 2: LQ letterform built from simple strokes/arcs
const makeLQLetterform = (): FormationSphere[] => {
  const spheres: FormationSphere[] = [];
  const colors = [COLORS.magenta, COLORS.lightPink, COLORS.lime, COLORS.black];

  // Lowercase "l" as a vertical column
  for (let i = 0; i < 18; i += 1) {
    const y = -0.9 + (i / 17) * 1.8;
    const radius = 0.07 + Math.random() * 0.05;
    spheres.push({
      position: [-0.9 + (Math.random() - 0.5) * 0.08, y, 0],
      radius,
      color: colors[i % colors.length],
    });
  }

  // "Q" outer circle
  const qCenter: [number, number, number] = [0.2, 0, 0];
  const qRadius = 0.9;
  const ringCount = 40;
  for (let i = 0; i < ringCount; i += 1) {
    const angle = (i / ringCount) * Math.PI * 2;
    const jitter = 0.04 * (Math.random() - 0.5);
    const x = qCenter[0] + Math.cos(angle) * (qRadius + jitter);
    const y = qCenter[1] + Math.sin(angle) * (qRadius + jitter);
    const radius = 0.08 + Math.random() * 0.06;
    spheres.push({
      position: [x, y, 0],
      radius,
      color: colors[i % colors.length],
    });
  }

  // Q tail
  for (let i = 0; i < 8; i += 1) {
    const t = i / 7;
    const x = qCenter[0] + 0.3 + t * 0.4;
    const y = qCenter[1] - 0.7 - t * 0.3;
    spheres.push({
      position: [x, y, 0],
      radius: 0.08,
      color: COLORS.black,
    });
  }

  // Q center dot (large lime sphere)
  spheres.push({
    position: qCenter,
    radius: 0.35,
    color: COLORS.lime,
  });

  return spheres;
};

const frame2: Formation = {
  id: 1,
  spheres: clampCount(makeLQLetterform()),
  ambientRotationAllowed: true,
};

// Frame 3: Converging Streams (rows left to right)
const makeConvergingStreams = (): FormationSphere[] => {
  const spheres: FormationSphere[] = [];
  const rowColors = [COLORS.magenta, COLORS.lightPink, COLORS.lime, COLORS.darkGreen, COLORS.black];
  const rows = rowColors.length;
  const perRow = 22;

  for (let r = 0; r < rows; r += 1) {
    const y = 0.6 - (r / (rows - 1)) * 1.2;
    const color = rowColors[r];
    for (let i = 0; i < perRow; i += 1) {
      const t = i / (perRow - 1);
      const x = -1.5 + t * 2.6;
      const mixRegion = t > 0.5;
      const mixedColor = mixRegion
        ? [COLORS.magenta, COLORS.lightPink, COLORS.lime, COLORS.darkGreen, COLORS.black][
            (i + r) % 5
          ]
        : color;
      spheres.push({
        position: [x, y, 0],
        radius: 0.07,
        color: mixedColor,
      });
    }
  }
  return spheres;
};

const frame3: Formation = {
  id: 2,
  spheres: clampCount(makeConvergingStreams()),
  ambientRotationAllowed: false,
};

// Frame 4: Compressed Line
const makeCompressedLine = (): FormationSphere[] => {
  const spheres: FormationSphere[] = [];
  const colors = [COLORS.magenta, COLORS.lightPink, COLORS.lime, COLORS.darkGreen, COLORS.black];
  const count = 40;
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    const x = -1.7 + t * 3.4;
    const y = 0;
    const radius = 0.08;
    const squash =
      i >= Math.floor(count / 2) - 2 && i <= Math.floor(count / 2) + 1;
    spheres.push({
      position: [x, y, 0],
      radius,
      color: colors[i % colors.length],
      squash,
    });
  }
  return spheres;
};

const frame4: Formation = {
  id: 3,
  spheres: clampCount(makeCompressedLine()),
  ambientRotationAllowed: false,
};

// Frame 5: Scattered Spread (~14 spheres)
const frame5: Formation = {
  id: 4,
  spheres: clampCount(
    makeScatteredCloud(14, [-1.6, 1.6], [-0.7, 0.7]),
  ),
  ambientRotationAllowed: true,
};

// Frame 6: Four Vertical Columns
const makeVerticalColumns = (): FormationSphere[] => {
  const spheres: FormationSphere[] = [];
  const columnColors = [COLORS.magenta, COLORS.lightPink, COLORS.lime, COLORS.black];
  const columns = columnColors.length;
  const perColumn = 16;

  for (let c = 0; c < columns; c += 1) {
    const color = columnColors[c];
    const x = -1.3 + (c / (columns - 1)) * 2.6;
    for (let i = 0; i < perColumn; i += 1) {
      const t = i / (perColumn - 1);
      const y = -0.9 + t * 1.8;
      const radius = 0.06 + (1 - t) * 0.12; // larger at bottom
      spheres.push({
        position: [x + (Math.random() - 0.5) * 0.08, y, 0],
        radius,
        color,
      });
    }
  }
  return spheres;
};

const frame6: Formation = {
  id: 5,
  spheres: clampCount(makeVerticalColumns()),
  ambientRotationAllowed: false,
};

// Frame 7: Dense Wave Surface
const makeWaveSurface = (): FormationSphere[] => {
  const spheres: FormationSphere[] = [];
  const cols = 26;
  const rows = 18;
  const width = 3.0;
  const depth = 1.6;
  const colors = [COLORS.magenta, COLORS.lightPink, COLORS.lime, COLORS.darkGreen, COLORS.black];

  for (let zIdx = 0; zIdx < rows; zIdx += 1) {
    for (let xIdx = 0; xIdx < cols; xIdx += 1) {
      const x = -width / 2 + (xIdx / (cols - 1)) * width;
      const z = -depth / 2 + (zIdx / (rows - 1)) * depth;
      const wave = Math.sin((xIdx / (cols - 1)) * Math.PI * 2) * 0.25 +
        Math.cos((zIdx / (rows - 1)) * Math.PI * 2) * 0.15;
      const y = -0.5 + wave;
      const float = Math.random() < 0.08;
      spheres.push({
        position: [x, y + (float ? 0.2 : 0), z],
        radius: 0.055,
        color: colors[(xIdx + zIdx) % colors.length],
        float,
      });
    }
  }
  return spheres;
};

const frame7: Formation = {
  id: 6,
  spheres: clampCount(makeWaveSurface()),
  ambientRotationAllowed: true,
};

// Frame 8: Hero Reveal - 4 large spheres in center
const makeHero = (): FormationSphere[] => {
  const spheres: FormationSphere[] = [];
  const labelsColors = [COLORS.magenta, COLORS.black, COLORS.lightPink, COLORS.lime];
  const count = labelsColors.length;
  const spacing = 0.9;
  for (let i = 0; i < count; i += 1) {
    const x = -((count - 1) * spacing) / 2 + i * spacing;
    spheres.push({
      position: [x, 0, 0],
      radius: 0.45,
      color: labelsColors[i],
    });
  }
  return spheres;
};

const frame8: Formation = {
  id: 7,
  spheres: clampCount(makeHero()),
  ambientRotationAllowed: true,
};

export const FORMATIONS: Formation[] = [
  frame1,
  frame2,
  frame3,
  frame4,
  frame5,
  frame6,
  frame7,
  frame8,
];

export const MAX_SPHERES = FORMATIONS.reduce(
  (max, f) => Math.max(max, f.spheres.length),
  0,
);

