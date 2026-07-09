import type { Dispatch, SetStateAction } from "react";

import type { Game } from "../../../gameEngine/core/Game";
import type { CardInstance } from "../../../gameEngine/cards/CardInstance";
import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { CardType } from "../../../gameEngine/enum/CardType";
import { CompletePlayFromHandAction } from "../../../gameEngine/actions/CompletePlayFromHandAction";
import { ActivateMainEffectAction } from "../../../gameEngine/actions/ActivateMainEffectAction";

import type { PendingCardChoice } from "../components/CardChoicePanel";
import { CompleteSearchTopDeckAction } from "../../../gameEngine/actions/CompleteSearchTopDeckAction";
import { CompleteDiscardHandAction } from "../../../gameEngine/actions/CompleteDiscardHandAction";
import type {
  PendingPlayDestination,
  PendingActivateMain,
} from "../types/PendingInteraction";

type Props = {
  game: Game;
  pendingCardChoice: PendingCardChoice | null;
  pendingPlayDestination: PendingPlayDestination;
  pendingActivateMain: PendingActivateMain;
  setPendingCardChoice: Dispatch<SetStateAction<PendingCardChoice | null>>;
  setPendingPlayDestination: Dispatch<SetStateAction<PendingPlayDestination>>;
  setPendingActivateMain: Dispatch<SetStateAction<PendingActivateMain>>;
  refresh: () => void;
};

export function useCardChoiceHandlers({
  game,
  pendingCardChoice,
  pendingPlayDestination,
  pendingActivateMain,
  setPendingCardChoice,
  setPendingPlayDestination,
  setPendingActivateMain,
  refresh,
}: Props) {
  const player1 = game.player1;
  const player2 = game.player2;

  const findSearchTopDeckAction = (sourceCard: CardInstance) => {
    for (const effect of sourceCard.card.effects) {
      for (const action of effect.actions) {
        if (action.type === "searchTopDeck") {
          return action;
        }
      }
    }

    return undefined;
  };

  const startPlayFromHandChoice = (
    sourceCard: CardInstance,
    playerId: string = player1.id
  ): boolean => {
    const playFromHandAction = sourceCard.card.raidEffects
      .flatMap((effect) => effect.actions)
      .find((action: any) => action.type === "playFromHand");

    if (!playFromHandAction || playFromHandAction.type !== "playFromHand") {
      return false;
    }

    const choicePlayer = playerId === player1.id ? player1 : player2;

    const candidates = choicePlayer.board.hand.filter((card) => {
      const target = playFromHandAction.target;

      if (target.names && target.names.length > 0) {
        if (!target.names.includes(card.card.name)) return false;
      }

      if (target.color && card.card.color !== target.color) {
        return false;
      }

      if (target.actionPointCost !== undefined) {
        if (card.card.actionPointCost !== target.actionPointCost) return false;
      }

      if (target.maxRequiredEnergyTotal !== undefined) {
        if (card.card.requiredEnergy.getTotal() > target.maxRequiredEnergyTotal) {
          return false;
        }
      }

      return true;
    });

    if (candidates.length === 0) {
      return false;
    }

    setPendingCardChoice({
      source: "playFromHand",
      title: `${sourceCard.card.name}: 手札から登場させるカードを選択`,
      cards: candidates,
      minCount: 0,
      maxCount: playFromHandAction.maxCount ?? 1,
      selectedCards: [],
      context: {
        sourceCard,
        playerId,
      },
    });

    return true;
  };

  const startSearchTopDeckChoice = (
    sourceCard: CardInstance,
    options?: {
      handIndex?: number;
    }
  ): boolean => {
    const action = findSearchTopDeckAction(sourceCard);

    if (!action || action.type !== "searchTopDeck") {
      return false;
    }

    const topCards = player1.board.deck.slice(-action.lookCount).reverse();

    const selectableCards = topCards.filter((card) => {
      const target = action.target;

      if (target.cardType === "character") {
        if (card.card.cardType !== CardType.Character) {
          return false;
        }
      }

      if (target.nameFilter && target.nameFilter.length > 0) {
        if (!target.nameFilter.includes(card.card.name)) {
          return false;
        }
      }

      return true;
    });

    setPendingCardChoice({
      source: "searchTopDeck",
      title: `${sourceCard.card.name}: 山札上${action.lookCount}枚から${action.takeCount}枚選択`,
      cards: topCards,
      selectableCards,
      minCount: 0,
      maxCount: action.takeCount,
      selectedCards: [],
      context: {
        sourceCard,
        handIndex: options?.handIndex,
      },
    });

    return true;
  };

  const handleToggleChoiceCard = (card: CardInstance) => {
    if (!pendingCardChoice) return;

    const alreadySelected = pendingCardChoice.selectedCards.includes(card);

    const nextSelectedCards = alreadySelected
      ? pendingCardChoice.selectedCards.filter((c) => c !== card)
      : pendingCardChoice.selectedCards.length < pendingCardChoice.maxCount
        ? [...pendingCardChoice.selectedCards, card]
        : pendingCardChoice.selectedCards;

    setPendingCardChoice({
      ...pendingCardChoice,
      selectedCards: nextSelectedCards,
    });
  };

  const handleConfirmCardChoice = () => {
    if (!pendingCardChoice) return;

    const selectedCount = pendingCardChoice.selectedCards.length;

    if (
      selectedCount < pendingCardChoice.minCount ||
      selectedCount > pendingCardChoice.maxCount
    ) {
      alert("選択枚数が正しくありません");
      return;
    }

    
    if (pendingCardChoice.source === "searchTopDeck") {
    const result = CompleteSearchTopDeckAction.execute(
        game,
        player1.id,
        pendingCardChoice.cards,
        pendingCardChoice.selectedCards
    );

    if (result.needsDiscard) {
        setPendingCardChoice({
        source: "discardHand",
        title: "手札を1枚捨ててください",
        cards: [...player1.board.hand],
        minCount: 1,
        maxCount: 1,
        selectedCards: [],
        context: pendingCardChoice.context,
        });
        refresh();
        return;
    }

    setPendingCardChoice(null);
    refresh();
    return;
    }

    if (pendingCardChoice.source === "discardHand") {
    try {
        CompleteDiscardHandAction.execute(
        game,
        player1.id,
        pendingCardChoice.selectedCards
        );

        if (pendingActivateMain) {
        ActivateMainEffectAction.execute(
            game,
            pendingActivateMain.sourceLine,
            pendingActivateMain.sourceIndex
        );

        setPendingActivateMain(null);
        setPendingCardChoice(null);
        refresh();
        return;
        }

        setPendingCardChoice(null);
        refresh();
    } catch (e) {
        alert(e instanceof Error ? e.message : String(e));
    }

    return;
    }

    if (pendingCardChoice.source === "playFromHand") {
      const selected = pendingCardChoice.selectedCards[0];

      if (!selected) {
        setPendingCardChoice(null);
        refresh();
        return;
      }

      if (!pendingCardChoice.context?.sourceCard) {
        alert("効果元カードが見つかりません");
        return;
      }

      setPendingPlayDestination({
        sourceCard: pendingCardChoice.context.sourceCard,
        playedCard: selected,
        allowedLines: [BoardLine.FrontLine, BoardLine.EnergyLine],
        rest: true,
        playerId: pendingCardChoice.context.playerId ?? player1.id,
      });

      setPendingCardChoice(null);
      refresh();
      return;
    }
  };

  const handleSelectPlayFromHandDestination = (
    destinationLine: BoardLine
  ) => {
    if (!pendingPlayDestination) return;

    try {
      CompletePlayFromHandAction.execute(
        game,
        pendingPlayDestination.sourceCard,
        pendingPlayDestination.playedCard,
        destinationLine,
        pendingPlayDestination.rest,
        pendingPlayDestination.playerId
      );

      setPendingPlayDestination(null);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleCancelCardChoice = () => {
    setPendingCardChoice(null);
  };

  return {
    startPlayFromHandChoice,
    startSearchTopDeckChoice,
    handleToggleChoiceCard,
    handleConfirmCardChoice,
    handleCancelCardChoice,
    handleSelectPlayFromHandDestination,
  };
}