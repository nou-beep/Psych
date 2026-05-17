// Body region taxonomy + SVG coordinates for the body-map silhouette.
// Coordinates are normalised to a 200×400 viewBox so the SVG can scale
// freely. Each region also lists the sensations that commonly cluster
// there (used as quick-pick chips in the client UI).

export type BodyRegionId =
  | "head"
  | "face"
  | "throat"
  | "chest"
  | "heart"
  | "shoulders"
  | "upper-back"
  | "arms-l"
  | "arms-r"
  | "hands-l"
  | "hands-r"
  | "stomach"
  | "gut"
  | "lower-back"
  | "pelvis"
  | "thighs"
  | "legs"
  | "feet"
  | "whole-body";

export interface BodyRegion {
  id: BodyRegionId;
  label: string;
  // Center coordinate in a 200×400 viewBox.
  cx: number;
  cy: number;
  // Radius of the hit-area circle the UI renders.
  r: number;
  // Common sensations clinicians ask about for this region.
  commonSensations: string[];
}

export const BODY_REGIONS: BodyRegion[] = [
  { id: "head", label: "Head", cx: 100, cy: 32, r: 22, commonSensations: ["headache", "pressure", "fog", "ringing"] },
  { id: "face", label: "Face", cx: 100, cy: 60, r: 12, commonSensations: ["heat", "flushing", "numbness", "tension"] },
  { id: "throat", label: "Throat", cx: 100, cy: 86, r: 9, commonSensations: ["tightness", "lump", "constriction", "voice change"] },
  { id: "shoulders", label: "Shoulders", cx: 100, cy: 108, r: 26, commonSensations: ["tension", "pulled-up", "ache"] },
  { id: "chest", label: "Chest", cx: 100, cy: 138, r: 18, commonSensations: ["tightness", "pressure", "breath restriction", "racing"] },
  { id: "heart", label: "Heart area", cx: 90, cy: 142, r: 10, commonSensations: ["racing", "pounding", "fluttering"] },
  { id: "arms-l", label: "Left arm", cx: 58, cy: 168, r: 12, commonSensations: ["heaviness", "tingling", "numbness"] },
  { id: "arms-r", label: "Right arm", cx: 142, cy: 168, r: 12, commonSensations: ["heaviness", "tingling", "numbness"] },
  { id: "hands-l", label: "Left hand", cx: 44, cy: 210, r: 10, commonSensations: ["clenching", "cold", "tingling", "shaking"] },
  { id: "hands-r", label: "Right hand", cx: 156, cy: 210, r: 10, commonSensations: ["clenching", "cold", "tingling", "shaking"] },
  { id: "upper-back", label: "Upper back", cx: 100, cy: 158, r: 14, commonSensations: ["tension", "knot", "ache"] },
  { id: "stomach", label: "Upper stomach", cx: 100, cy: 178, r: 14, commonSensations: ["knots", "nausea", "butterflies"] },
  { id: "gut", label: "Lower gut", cx: 100, cy: 208, r: 14, commonSensations: ["cramping", "heaviness", "urgency"] },
  { id: "lower-back", label: "Lower back", cx: 100, cy: 224, r: 12, commonSensations: ["ache", "tension"] },
  { id: "pelvis", label: "Pelvis", cx: 100, cy: 240, r: 12, commonSensations: ["tension", "heaviness", "shutdown"] },
  { id: "thighs", label: "Thighs", cx: 100, cy: 274, r: 16, commonSensations: ["heaviness", "restlessness", "shaking"] },
  { id: "legs", label: "Lower legs", cx: 100, cy: 320, r: 14, commonSensations: ["restless legs", "weakness", "tingling"] },
  { id: "feet", label: "Feet", cx: 100, cy: 364, r: 12, commonSensations: ["cold", "tingling", "ungrounded"] },
  { id: "whole-body", label: "Whole body", cx: 100, cy: 200, r: 0, commonSensations: ["heaviness", "shutdown", "numbness", "flooding", "fizzing"] },
];

export const COMMON_SENSATIONS = [
  "tightness",
  "pressure",
  "knots",
  "numbness",
  "tingling",
  "heat",
  "cold",
  "heaviness",
  "shaking",
  "racing",
  "flooding",
  "shutdown",
  "dissociation",
  "sensory overload",
  "ache",
  "fizzing",
  "constriction",
  "fog",
] as const;

export type CommonSensation = (typeof COMMON_SENSATIONS)[number];

export function findRegion(id: string): BodyRegion | undefined {
  return BODY_REGIONS.find((r) => r.id === id);
}
