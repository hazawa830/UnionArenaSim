
import { EffectAction } from "./EffectAction";

import { DrawEffectAction } from "./actions/DrawEffectAction";
import { ActivateEffectAction } from "./actions/ActivateEffectAction";
import { ModifyBpThisTurnEffectAction } from "./actions/ModifyBpThisTurnEffectAction";
import { SearchTopDeckEffectAction } from "./actions/SearchTopDeckEffectAction";
import { DiscardHandEffectAction } from "./actions/DiscardHandEffectAction";
import { DestroyEffectAction } from "./actions/DestroyEffectAction";
import { EffectContext } from "./EffectContext";

export class EffectActionExecutor {
  public static execute(
    context: EffectContext,
    action: EffectAction
  ): void {
    switch (action.type) {
      case "draw":
        DrawEffectAction.execute(context, action);
        return;

      case "activate":
        ActivateEffectAction.execute(context, action);
        return;

      case "modifyBpThisTurn":
        ModifyBpThisTurnEffectAction.execute(context, action);
        return;

      case "searchTopDeck":
        SearchTopDeckEffectAction.execute(context, action);
        return;

      case "discardHand":
        DiscardHandEffectAction.execute(context, action);
        return;

      case "destroy":
        DestroyEffectAction.execute(context, action);
        return;

      default:
        throw new Error(`Unknown effect action: ${(action as any).type}`);
    }
  }
}