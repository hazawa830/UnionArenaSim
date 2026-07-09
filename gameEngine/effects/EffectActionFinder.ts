import type { CardInstance } from "../cards/CardInstance";
import type {
  SearchTopDeckAction,
  PlayFromHandAction,
  SelectableModifyBpThisTurnAction,
} from "./EffectActionTypes";
import { EffectActionGuards } from "./EffectActionGuards";

export class EffectActionFinder {
  static findSearchTopDeckAction(
    sourceCard: CardInstance
  ): SearchTopDeckAction | undefined {
    for (const effect of sourceCard.card.effects) {
      for (const action of effect.actions) {
        if (EffectActionGuards.isSearchTopDeckAction(action)) {
          return action;
        }
      }
    }

    return undefined;
  }

  static findPlayFromHandAction(
    sourceCard: CardInstance
  ): PlayFromHandAction | undefined {
    for (const effect of sourceCard.card.raidEffects) {
      for (const action of effect.actions) {
        if (EffectActionGuards.isPlayFromHandAction(action)) {
          return action;
        }
      }
    }

    return undefined;
  }

  static findSelectableModifyBpAction(
    sourceCard: CardInstance
  ): SelectableModifyBpThisTurnAction | undefined {
    for (const effect of sourceCard.card.effects) {
      for (const action of effect.actions) {
        if (EffectActionGuards.isSelectableModifyBpThisTurnAction(action)) {
          return action;
        }
      }
    }

    return undefined;
  }

  static findActivateMainEffect(sourceCard: CardInstance) {
    return sourceCard.card.effects.find(
      (effect) => effect.trigger === "activateMain"
    );
  }
}