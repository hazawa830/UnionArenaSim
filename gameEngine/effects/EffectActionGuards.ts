import type {
  SearchTopDeckAction,
  PlayFromHandAction,
  SelectableModifyBpThisTurnAction,
} from "./EffectActionTypes";

export class EffectActionGuards {
  static isSearchTopDeckAction(action: any): action is SearchTopDeckAction {
    return (
      action?.type === "searchTopDeck" &&
      typeof action.lookCount === "number" &&
      typeof action.takeCount === "number" &&
      action.target !== undefined
    );
  }

  static isPlayFromHandAction(action: any): action is PlayFromHandAction {
    return (
      action?.type === "playFromHand" &&
      action.target !== undefined
    );
  }

  static isSelectableModifyBpThisTurnAction(
    action: any
  ): action is SelectableModifyBpThisTurnAction {
    return (
      action?.type === "modifyBpThisTurn" &&
      typeof action.amount === "number" &&
      typeof action.target === "object" &&
      action.target !== null &&
      (action.target.side === "own" || action.target.side === "opponent") &&
      (
        action.target.zone === "frontLine" ||
        action.target.zone === "energyLine" ||
        action.target.zone === "field"
      )
    );
  }
}