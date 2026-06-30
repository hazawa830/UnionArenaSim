export type EffectCondition =
  | {
      type: "hasCharacterNamesOnField";
      names: string[];
      mode: "all" | "any";
    }
  | {
      type: "isOnLine";
      line: "frontLine" | "energyLine";
    };