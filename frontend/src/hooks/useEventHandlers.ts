import type { Dispatch, SetStateAction } from "react";

import type { Game } from "../../../gameEngine/core/Game";
import type { CardInstance } from "../../../gameEngine/cards/CardInstance";
import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { GamePhase } from "../../../gameEngine/enum/GamePhase";
import { UseEventCardAction } from "../../../gameEngine/actions/UseEventCardAction";

import type { PendingSelection } from "../types/PendingSelection";

type Props = {
  game: Game;
  isYourTurn: boolean;
  setPendingSelection: Dispatch<SetStateAction<PendingSelection | null>>;
  startSearchTopDeckChoice: (
    sourceCard: CardInstance,
    options?: { handIndex?: number }
  ) => boolean;
  refresh: () => void;
};

export function useEventHandlers({
  game,
  isYourTurn,
  setPendingSelection,
  startSearchTopDeckChoice,
  refresh,
}: Props) {
  const player1 = game.player1;

  const getEventRequiredTargetCount = (handIndex: number): number => {
    const card = player1.board.hand[handIndex];

    if (!card) return 0;

    const targetActions = card.card.effects.flatMap((effect) =>
      effect.actions.filter((action: any) => {
        const target = action.target;
        if (!target) return false;
        if (target.zone === "ap") return false;

        return (
          target.zone === "frontLine" ||
          target.zone === "energyLine" ||
          target.zone === "field"
        );
      })
    );

    return targetActions.length;
  };

  const handleUseEvent = (handIndex: number) => {
    if (!isYourTurn) return alert("相手ターンです");
    if (game.phase !== GamePhase.Main) return alert("メインフェーズのみです");

    const eventCard = player1.board.hand[handIndex];

    if (!eventCard) {
      alert("カードがありません");
      return;
    }

    const requiredCount = getEventRequiredTargetCount(handIndex);

    if (requiredCount > 0) {
      setPendingSelection({
        source: "event",
        handIndex,
        requiredCount,
        selectedTargets: [],
        allowedSide: "both",
        allowedLines: [BoardLine.FrontLine, BoardLine.EnergyLine],
      });
      return;
    }

    try {
      const startedSearch = startSearchTopDeckChoice(eventCard, {
        handIndex,
      });

      if (startedSearch) {
        return;
      }

      UseEventCardAction.execute(game, handIndex);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  return {
    handleUseEvent,
  };
}