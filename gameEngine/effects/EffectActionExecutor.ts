import { Game } from "../core/Game";
import { CardInstance } from "../cards/CardInstance";
import { EffectAction } from "./EffectAction";

import { DrawEffectAction } from "./actions/DrawEffectAction";
import { ActivateEffectAction } from "./actions/ActivateEffectAction";
import { ModifyBpThisTurnEffectAction } from "./actions/ModifyBpThisTurnEffectAction";
import { SearchTopDeckEffectAction } from "./actions/SearchTopDeckEffectAction";
import { DiscardHandEffectAction } from "./actions/DiscardHandEffectAction";

export class EffectActionExecutor {
  public static execute(
    game: Game,
    source: CardInstance,
    action: EffectAction
  ): void {
    switch (action.type) {
      case "draw":
        DrawEffectAction.execute(game, source, action);
        return;

      case "activate":
        ActivateEffectAction.execute(game, source, action);
        return;

      case "modifyBpThisTurn":
        ModifyBpThisTurnEffectAction.execute(game, source, action);
        return;
      case "searchTopDeck":
        SearchTopDeckEffectAction.execute(game, source, action);
        return;

        case "discardHand":
        DiscardHandEffectAction.execute(game, source, action);
        return;
      default:
        throw new Error(`Unknown effect action: ${(action as any).type}`);
    }
  }
}