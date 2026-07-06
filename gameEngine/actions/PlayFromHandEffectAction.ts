import { CardInstance } from "../cards/CardInstance";
import { CharacterCard } from "../cards/CharacterCard";
import { StageCard } from "../cards/StageCard";
import { BoardLine } from "../enum/BoardLine";
import { CardType } from "../enum/CardType";
import { EffectAction } from "../effects/EffectAction";
import { EffectContext } from "../effects/EffectContext";
import { GameLogger } from "../log/GameLogger";
import { LogType } from "../enum/LogType";
import { EffectLogType } from "../enum/EffectLogType";

type PlayFromHandAction = Extract<EffectAction, { type: "playFromHand" }>;


export class PlayFromHandEffectAction {
  public static execute(
    context: EffectContext,
    action: PlayFromHandAction
  ): void {
    const board = context.actor.board;
    const maxCount = action.maxCount ?? 1;
    if (context.event?.skipPlayFromHand) {
      return;
    }
    for (let count = 0; count < maxCount; count++) {
      const handIndex = board.hand.findIndex((card) =>
        this.matchesTarget(card, action)
      );

      if (handIndex === -1) {
        if (action.optional) return;
        throw new Error("No matching card in hand.");
      }

      const destinationSlot =
        action.destination === BoardLine.FrontLine
          ? board.getEmptyFrontSlot()
          : board.getEmptyEnergySlot();

      if (!destinationSlot) {
        if (action.optional) return;
        throw new Error(`No empty slot in ${action.destination}.`);
      }

      const [card] = board.hand.splice(handIndex, 1);

      card.isRest = action.rest ?? false;
      destinationSlot.setCard(card);

      GameLogger.add(context.game, {
        playerId: context.actor.id,
        type: LogType.Effect,
        message: `${card.card.name}を手札から${action.destination}へ登場`,
        payload: {
          effectType: EffectLogType.PlayFromHand,

          sourceInstanceId: context.source.instanceId,
          sourceCardId: context.source.card.id,
          sourceCardName: context.source.card.name,

          playedInstanceId: card.instanceId,
          playedCardId: card.card.id,
          playedCardName: card.card.name,

          handIndex,
          destination: action.destination,
          isRest: card.isRest,
          countIndex: count + 1,
          maxCount,
        },
      });
    }
  }

  private static matchesTarget(
    cardInstance: CardInstance,
    action: PlayFromHandAction
  ): boolean {
    const card = cardInstance.card;
    const target = action.target;

    if (target.cardType && card.cardType !== (target.cardType as CardType)) {
      return false;
    }

    if (target.names && target.names.length > 0) {
      if (!target.names.includes(card.name)) return false;
    }

    if (target.color && card.color !== target.color) {
      return false;
    }

    if (target.actionPointCost !== undefined) {
      if (card.actionPointCost !== target.actionPointCost) return false;
    }

    if (target.maxRequiredEnergyTotal !== undefined) {
      if (card.requiredEnergy.getTotal() > target.maxRequiredEnergyTotal) {
        return false;
      }
    }

    if (card.cardType === CardType.Character && !(card instanceof CharacterCard)) {
      return false;
    }

    if (card.cardType === CardType.Stage && !(card instanceof StageCard)) {
      return false;
    }

    return true;
  }
}