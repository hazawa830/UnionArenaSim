import { TargetType } from "./TargetType";
import { EffectTarget } from "./EffectTarget";
import { Effect } from "./Effect";
import { CardZone } from "../enum/CardZone";
import { DeckPosition } from "../enum/DeckPosition";
import { CardFilter } from "./CardFilter";
export type LookTopDeckSelection = {
  
  minCount: number;

  int: number;

  
  filter?: CardFilter;

  
  destination: CardZone;

  
  reveal?: boolean;

  
  id?: string;

  
  label?: string;
};

export type LookTopDeckAction = {
  type: "lookTopDeck";

  /**
   * 山札上から見る枚数。
   */
  lookCount: number;

  /**
   * 公開したカードから行う選択。
   * 将来、複数の振り分けを扱うため配列にする。
   */
  selections: LookTopDeckSelection[];

  /**
   * どの選択にも使われなかったカードの戻し先。
   * 現段階ではDeckを想定する。
   */
  restDestination: CardZone;

  /**
   * 残りを山札上・山札下のどちらへ戻すか。
   */
  restDeckPosition?: DeckPosition;

  /**
   * 残りのカードを望む順番に並べ替えられるか。
   */
  reorderRest?: boolean;

  /**
   * 1枚以上選んだ場合に実行する後続効果。
   */
  ifSelected?: EffectAction[];
};
export type SearchTopDeckAction = {
  type: "searchTopDeck";
  lookCount: number;
  takeCount: number;
  target: {
    cardType?: "character" | "event" | "stage";
    nameFilter?: string[];
    features?: string[];
  };
  restToBottom: boolean;
  optional?: boolean;
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
  | PlayFromHandAction
  | LookTopDeckAction;