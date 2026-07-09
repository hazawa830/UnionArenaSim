import { TargetType } from "./TargetType";
import { EffectTarget } from "./EffectTarget";
import { Effect } from "./Effect";

export type SearchTopDeckAction = {
  type: "searchTopDeck";
  lookCount: number;
  takeCount: number;
  target: {
    cardType?: "character" | "event" | "stage";
    nameFilter?: string[];
  };
  restToBottom: boolean;
  ifTaken?: EffectAction[];
};

export type PlayFromHandAction = {
  type: "playFromHand";
  target: {
    cardType?: "character" | "stage" | "event";
    names?: string[];
    color?: string;
    maxRequiredEnergyTotal?: number;
    actionPointCost?: number;
  };
  destination: "frontLine" | "energyLine";
  rest?: boolean;
  maxCount?: number;
  optional?: boolean;
};

export type DrawAction = {
  type: "draw";
  count: number;
};

export type ActivateAction = {
  type: "activate";
  target: TargetType | EffectTarget;
  count?: number;
};

export type ModifyBpThisTurnAction = {
  type: "modifyBpThisTurn";
  target: TargetType | EffectTarget;
  amount: number;
};

export type DiscardHandAction = {
  type: "discardHand";
  count: number;
};

export type DestroyAction = {
  type: "destroy";
  target: EffectTarget;
};

export type ModifyBpContinuousAction = {
  type: "modifyBpContinuous";
  target: "self";
  amount: number;
};

export type GrantEffectAction = {
  type: "grantEffect";
  target: "self";
  effect: Effect;
};

export type EffectAction =
  | DrawAction
  | ActivateAction
  | ModifyBpThisTurnAction
  | SearchTopDeckAction
  | DiscardHandAction
  | DestroyAction
  | ModifyBpContinuousAction
  | GrantEffectAction
  | PlayFromHandAction;