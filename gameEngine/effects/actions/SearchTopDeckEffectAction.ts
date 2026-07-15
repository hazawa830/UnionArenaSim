import { CardInstance } from "../../cards/CardInstance";
import { CardType } from "../../enum/CardType";
import { CardZone } from "../../enum/CardZone";
import { DeckPosition } from "../../enum/DeckPosition";
import { CardMovementService } from "../../service/CardMovementService";
import { EffectAction } from "../EffectAction";
import { EffectActionExecutor } from "../EffectActionExecutor";
import { EffectContext } from "../EffectContext";

type SearchTopDeckAction = Extract<
  EffectAction,
  { type: "searchTopDeck" }
>;

export class SearchTopDeckEffectAction {
  public static execute(
    context: EffectContext,
    action: SearchTopDeckAction
  ): void {
    const actor = context.actor;
    const board = actor.board;

    // まだ山札から取り除かず、公開対象だけを取得する
    const revealedCards = board.deck.slice(0, action.lookCount);

    const matchedCards = revealedCards.filter((card) =>
      this.matchesTarget(card, action)
    );

    const takenCards = matchedCards.slice(0, action.takeCount);

    if (takenCards.length > 0) {
      CardMovementService.moveCards(
        actor,
        takenCards,
        CardZone.Deck,
        CardZone.Hand
      );
    }

    const remainingCards = revealedCards.filter(
      (card) => !takenCards.includes(card)
    );

    CardMovementService.moveCardsWithinDeck(
      actor,
      remainingCards,
      action.restToBottom
        ? DeckPosition.Bottom
        : DeckPosition.Top
    );

    if (takenCards.length > 0 && action.ifTaken) {
      for (const nextAction of action.ifTaken) {
        /*
         * discardHandはUIで選択対象を決めてから実行するため、
         * ここでは即時実行しない。
         */
        if (nextAction.type === "discardHand") {
          continue;
        }

        EffectActionExecutor.execute(context, nextAction);
      }
    }
  }
  
  private static matchesTarget(
    card: CardInstance,
    action: SearchTopDeckAction
  ): boolean {
    if (
      action.target.cardType &&
      card.card.cardType !==
        (action.target.cardType as CardType)
    ) {
      return false;
    }

    if (
      action.target.nameFilter &&
      action.target.nameFilter.length > 0 &&
      !action.target.nameFilter.includes(card.card.name)
    ) {
      return false;
    }

    if (
      action.target.features &&
      action.target.features.length > 0
    ) {
      const hasMatchingFeature =
        action.target.features.some((feature) =>
          card.card.features.includes(feature)
        );

      if (!hasMatchingFeature) {
        return false;
      }
    }

    return true;
  }
}