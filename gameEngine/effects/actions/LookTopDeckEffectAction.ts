import { CardInstance } from "../../cards/CardInstance";
import { EffectAction } from "../EffectAction";
import { EffectContext } from "../EffectContext";

type LookTopDeckAction = Extract<
  EffectAction,
  { type: "lookTopDeck" }
>;

export type LookTopDeckSelectionCandidates = {
  selectionId: string;
  candidateCards: CardInstance[];
};

export type LookTopDeckResult = {
  revealedCards: CardInstance[];
  selections: LookTopDeckSelectionCandidates[];
};

export class LookTopDeckEffectAction {
  public static createResult(
    context: EffectContext,
    action: LookTopDeckAction
  ): LookTopDeckResult {
    const revealedCards = context.actor.board.deck.slice(
      0,
      action.lookCount
    );

    const selections = action.selections.map((selection) => ({
      selectionId: selection.id,
      candidateCards: revealedCards.filter((card) =>
        this.matchesFilter(card, selection.filter)
      )
    }));

    return {
      revealedCards,
      selections
    };
  }

  private static matchesFilter(
    card: CardInstance,
    filter: LookTopDeckAction["selections"][number]["filter"]
  ): boolean {
    if (!filter) {
      return true;
    }

    /*
     * 既に作成したCardFilterMatcherがあるなら、
     * ここは以下だけでよいです。
     *
     * return CardFilterMatcher.matches(card, filter);
     */

    if (
      filter.features &&
      filter.features.length > 0 &&
      !filter.features.some((feature) =>
        card.card.features.includes(feature)
      )
    ) {
      return false;
    }

    return true;
  }
}