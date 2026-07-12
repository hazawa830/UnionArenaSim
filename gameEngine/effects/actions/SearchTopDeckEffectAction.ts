import { CardInstance } from "../../cards/CardInstance";
import { EffectAction } from "../EffectAction";
import { EffectActionExecutor } from "../EffectActionExecutor";
import { EffectContext } from "../EffectContext";
import { CardType } from "../../enum/CardType";

type SearchTopDeckAction = Extract<EffectAction, { type: "searchTopDeck" }>;

export class SearchTopDeckEffectAction {
  public static execute(
    context: EffectContext,
    action: SearchTopDeckAction
  ): void {
    const board = context.actor.board;

    const revealedCards = board.deck.splice(0, action.lookCount);

    const matchedCards = revealedCards.filter((card) =>
      this.matchesTarget(card, action)
    );

    const takenCards = matchedCards.slice(0, action.takeCount);

    for (const takenCard of takenCards) {
      board.hand.push(takenCard);
    }

    const remainingCards = revealedCards.filter(
      (card) => !takenCards.includes(card)
    );

    if (action.restToBottom) {
      board.deck.push(...remainingCards);
    } else {
      board.deck.unshift(...remainingCards);
    }

    if (takenCards.length > 0 && action.ifTaken) {
      for (const nextAction of action.ifTaken) {
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
    if (action.target.cardType) {
      if (card.card.cardType !== (action.target.cardType as CardType)) {
        return false;
      }
    }

    if (action.target.nameFilter && action.target.nameFilter.length > 0) {
      if (!action.target.nameFilter.includes(card.card.name)) {
        return false;
      }
    }

    return true;
  }
}