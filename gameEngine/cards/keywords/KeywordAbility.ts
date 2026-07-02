export type Keyword =
  | {
      type: "step";
    }
  | {
      type: "snipe";
    }
  | {
      type: "doubleAttack";
    }
  | {
      type: "doubleBlock";
    }
  | {
      type: "impact";
      value: number;
    }
  | {
      type: "impactPlus";
      value: number;
    }
  | {
      type: "damage";
      value: number;
    }
  | {
      type: "damagePlus";
      value: number;
    }
  | {
      type: "impactNullify";
    };