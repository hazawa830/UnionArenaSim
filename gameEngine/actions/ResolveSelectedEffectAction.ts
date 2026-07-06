import { Game } from "../core/Game";
import { CardInstance } from "../cards/CardInstance";
import { EffectAction } from "../effects/EffectAction";
import { EffectActionExecutor } from "../effects/EffectActionExecutor";
import { EffectContext } from "../effects/EffectContext";

export class ResolveSelectedEffectAction {
  public static execute(
    game: Game,
    source: CardInstance,
    action: EffectAction,
    selectedTargets: CardInstance[]
  ): void {
    const actor = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    const context: EffectContext = {
      game,
      source,
      actor,
      opponent,
      event: {
        selectedTargets,
      },
    };

    EffectActionExecutor.execute(context, action);
  }
}