import { EffectCost } from "./EffectCost";
import { EffectContext } from "./EffectContext";

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
        }

        return;
      }

      default:
        throw new Error(`Unknown effect cost: ${(cost as any).type}`);
    }
  }
}