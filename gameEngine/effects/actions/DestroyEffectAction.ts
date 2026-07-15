import { CardZone } from "../../enum/CardZone";
import { EffectLogType } from "../../enum/EffectLogType";
import { LogType } from "../../enum/LogType";
import { GameLogger } from "../../log/GameLogger";
import { CardMovementService } from "../../service/CardMovementService";
import { EffectAction } from "../EffectAction";
import { EffectContext } from "../EffectContext";
import { EffectTargetResolver } from "../EffectTargetResolver";
import { CardZoneService } from "../../service/CardZoneService";

type DestroyAction = Extract<
  EffectAction,
  { type: "destroy" }
>;

export class DestroyEffectAction {
  public static execute(
    context: EffectContext,
    action: DestroyAction
  ): void {
    const candidates =
      EffectTargetResolver.resolveCandidates(
        context,
        action.target
      );

    const target = candidates[0];

    if (!target) {
      return;
    }

    const targetPlayer =
      action.target.side === "own"
        ? context.actor
        : context.opponent;

    const sourceZone = CardZoneService.findCardZone(
  targetPlayer,
  target,
  [
    CardZone.FrontLine,
    CardZone.EnergyLine
  ]
);

    if (!sourceZone) {
      return;
    }

    CardMovementService.moveCards(
      targetPlayer,
      [target],
      sourceZone,
      CardZone.Trash
    );

    GameLogger.add(context.game, {
      playerId: targetPlayer.id,
      type: LogType.Effect,
      message: `${target.card.name}を効果で退場させた`,
      payload: {
        effectType: EffectLogType.Destroy,
        sourceInstanceId: context.source.instanceId,
        sourceCardId: context.source.card.id,
        sourceCardName: context.source.card.name,
        destroyedInstanceId: target.instanceId,
        destroyedCardId: target.card.id,
        destroyedCardName: target.card.name,
        targetSide: action.target.side,
        targetZone:
          sourceZone === CardZone.FrontLine
            ? "frontLine"
            : "energyLine"
      }
    });
  }

  private static resolveSourceZone(
    player: EffectContext["actor"],
    target: Parameters<
      typeof CardMovementService.moveCards
    >[1][number]
  ): CardZone.FrontLine | CardZone.EnergyLine | undefined {
    if (
      player.board.frontLine.some(
        (slot) => slot.getCard() === target
      )
    ) {
      return CardZone.FrontLine;
    }

    if (
      player.board.energyLine.some(
        (slot) => slot.getCard() === target
      )
    ) {
      return CardZone.EnergyLine;
    }

    return undefined;
  }
}