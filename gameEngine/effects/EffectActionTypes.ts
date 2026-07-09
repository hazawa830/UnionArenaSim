import type { BoardLine } from "../enum/BoardLine";
import type { CardType } from "../enum/CardType";

export type EffectActionType =
  | "searchTopDeck"
  | "playFromHand"
  | "modifyBpThisTurn";

export type SearchTopDeckAction = {
  type: "searchTopDeck";
  lookCount: number;
  takeCount: number;
  target: {
    cardType?: "character";
    nameFilter?: string[];
  };
};

export type PlayFromHandAction = {
  type: "playFromHand";
  maxCount?: number;
  target: {
    names?: string[];
    color?: string;
    actionPointCost?: number;
    maxRequiredEnergyTotal?: number;
  };
};

export type SelectableModifyBpTarget = {
  side: "own" | "opponent";
  zone: "frontLine" | "energyLine" | "field";
  maxCount?: number;
};

export type SelectableModifyBpThisTurnAction = {
  type: "modifyBpThisTurn";
  amount: number;
  target: SelectableModifyBpTarget;
};

export type EffectAction =
  | SearchTopDeckAction
  | PlayFromHandAction
  | SelectableModifyBpThisTurnAction;