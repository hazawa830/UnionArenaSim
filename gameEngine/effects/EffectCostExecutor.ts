import { EffectCost } from "./EffectCost";
import { EffectContext } from "./EffectContext";
import { GameLogger } from "../log/GameLogger";
import { LogType } from "../enum/LogType";
import { EffectLogType } from "../enum/EffectLogType";
export class EffectCostExecutor {
  public static payCosts(
    context: EffectContext,
    costs?: EffectCost[]
  ): void {
    if (!costs || costs.length === 0) {
      return;
    }

    for (const cost of costs) {
      this.payCost(context, cost);
    }
  }

  private static payCost(
    context: EffectContext,
    cost: EffectCost
  ): void {
    switch (cost.type) {
      case "restSelf": {
        if (context.source.isRest) {
          throw new Error("Rested card cannot pay restSelf cost.");
        }

        context.source.isRest = true;
        return;
      }

      case "discardHand": {
        for (let i = 0; i < cost.count; i++) {
          const discarded = context.actor.board.hand.shift();

          if (!discarded) {
            throw new Error("Not enough hand cards to pay discardHand cost.");
          }

          context.actor.board.trash.push(discarded);
          GameLogger.add(context.game, {
            playerId: context.actor.id,
            type: LogType.Effect,
            message: `${discarded.card.name}をコストとして捨てた`,
            payload: {
              effectType: EffectLogType.DiscardHand,

              sourceInstanceId: context.source.instanceId,
              sourceCardId: context.source.card.id,
              sourceCardName: context.source.card.name,

              discardedInstanceId: discarded.instanceId,
              discardedCardId: discarded.card.id,
              discardedCardName: discarded.card.name,

              discardIndex: i + 1,
              discardCount: cost.count,
            },
          });
        }

        return;
      }

      default:
        throw new Error(`Unknown effect cost: ${(cost as any).type}`);
    }
  }
}