export type EffectCondition =
  | {
      type: "hasCharacterNamesOnField";
      names: string[];
      mode: "all" | "any";
    }
  | {
      type: "isOnLine";
      line: "frontLine" | "energyLine";
    }
  | {
      type: "attackerNameIs";
      names: string[];
    }
    | {
    type: "hasCharacterNamesOnFrontLine";
    names: string[];
    mode: "all" | "any";
  };