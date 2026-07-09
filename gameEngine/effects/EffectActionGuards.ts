import type {
  SearchTopDeckAction,
  PlayFromHandAction,
  ModifyBpThisTurnAction,
  DrawAction,
  DestroyAction,
  ActivateAction,
} from "./EffectAction";

export class EffectActionGuards {
  static isSearchTopDeckAction(action: unknown): action is SearchTopDeckAction {
    return (
      typeof action === "object" &&
      action !== null &&
      (action as any).type === "searchTopDeck" &&
      typeof (action as any).lookCount === "number" &&
      typeof (action as any).takeCount === "number" &&
      (action as any).target !== undefined
    );
  }

  static isPlayFromHandAction(action: unknown): action is PlayFromHandAction {
    return (
      typeof action === "object" &&
      action !== null &&
      (action as any).type === "playFromHand" &&
      (action as any).target !== undefined
    );
  }

  static isSelectableModifyBpThisTurnAction(
    action: unknown
  ): action is ModifyBpThisTurnAction {
    return (
      typeof action === "object" &&
      action !== null &&
      (action as any).type === "modifyBpThisTurn" &&
      typeof (action as any).amount === "number" &&
      typeof (action as any).target === "object" &&
      (action as any).target !== null
    );
  }

  static isDrawAction(action: unknown): action is DrawAction {
    return (
      typeof action === "object" &&
      action !== null &&
      (action as any).type === "draw" &&
      typeof (action as any).count === "number"
    );
  }

  static isDestroyAction(action: unknown): action is DestroyAction {
    return (
      typeof action === "object" &&
      action !== null &&
      (action as any).type === "destroy" &&
      (action as any).target !== undefined
    );
  }

  static isActivateAction(action: unknown): action is ActivateAction {
    return (
      typeof action === "object" &&
      action !== null &&
      (action as any).type === "activate" &&
      (action as any).target !== undefined
    );
  }
}