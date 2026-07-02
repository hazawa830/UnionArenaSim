export type RaidCondition =
  | {
      type: "cardName";
      names: string[];
    };