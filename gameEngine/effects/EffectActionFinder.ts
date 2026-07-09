import type { CardInstance } from "../cards/CardInstance";
import type {
  SearchTopDeckAction,
  PlayFromHandAction,
  ModifyBpThisTurnAction,
  DrawAction,
  DestroyAction,
  ActivateAction,
} from "./EffectAction";
import type { Effect } from "./Effect";
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
  ): ModifyBpThisTurnAction | undefined {
    for (const effect of sourceCard.card.effects) {
      for (const action of effect.actions) {
        if (EffectActionGuards.isSelectableModifyBpThisTurnAction(action)) {
          return action;
        }
      }
    }

    return undefined;
  }

  static findDrawAction(sourceCard: CardInstance): DrawAction | undefined {
    for (const effect of sourceCard.card.effects) {
      for (const action of effect.actions) {
        if (EffectActionGuards.isDrawAction(action)) {
          return action;
        }
      }
    }

    return undefined;
  }

  static findDestroyAction(
    sourceCard: CardInstance
  ): DestroyAction | undefined {
    for (const effect of sourceCard.card.effects) {
      for (const action of effect.actions) {
        if (EffectActionGuards.isDestroyAction(action)) {
          return action;
        }
      }
    }

    return undefined;
  }

  static findActivateAction(
    sourceCard: CardInstance
  ): ActivateAction | undefined {
    for (const effect of sourceCard.card.effects) {
      for (const action of effect.actions) {
        if (EffectActionGuards.isActivateAction(action)) {
          return action;
        }
      }
    }

    return undefined;
  }

  static findActivateMainEffect(
    sourceCard: CardInstance
  ): Effect | undefined {
    return sourceCard.card.effects.find(
      (effect) => effect.trigger === "activateMain"
    );
  }
}