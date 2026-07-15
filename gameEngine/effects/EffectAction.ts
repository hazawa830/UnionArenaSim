import { CardZone } from "../enum/CardZone";
import { DeckPosition } from "../enum/DeckPosition";
import { CardFilter } from "./CardFilter";
import { Effect } from "./Effect";
import { EffectTarget } from "./EffectTarget";
import { TargetType } from "./TargetType";

export type LookTopDeckSelection = {
  /**
   * 選択処理を識別するID。
   */
  id: string;

  /**
   * UI表示用の文言。
   */
  label?: string;

  /**
   * 最低選択枚数。
   * 「1枚まで」の場合は0。
   */
  minCount: number;

  /**
   * 最大選択枚数。
   */
  maxCount: number;

  /**
   * 選択可能なカードの条件。
   */
  filter?: CardFilter;

  /**
   * 選択したカードの移動先。
   */
  destination: CardZone;

  /**
   * 移動先が山札の場合の配置位置。
   */
  deckPosition?: DeckPosition;

  /**
   * 選択したカードを公開扱いにするか。
   */
  reveal?: boolean;
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
   * どの選択にも使われなかったカードの移動先。
   */
  restDestination: CardZone;

  /**
   * 残りを山札へ置く場合の配置位置。
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