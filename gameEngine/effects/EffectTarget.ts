export type EffectTarget = {
  side: "own" | "opponent";
  zone: "field" | "frontLine" | "energyLine" | "ap";
  cardType?: "character";
  excludeSelf?: boolean;
  maxCount?: number;
  nameFilter?: string[];
};