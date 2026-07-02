export type AttackTarget =
  | {
      type: "player";
    }
  | {
      type: "frontLineCharacter";
      index: number;
    };