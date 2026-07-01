export type EffectCost =
  | {
      type: "restSelf";
    }
  | {
      type: "discardHand";
      count: number;
    };