import type { Dispatch, SetStateAction } from "react";

import type { Game } from "../../../gameEngine/core/Game";
import type { CardInstance } from "../../../gameEngine/cards/CardInstance";
import { BoardLine } from "../../../gameEngine/enum/BoardLine";

import { UseEventCardAction } from "../../../gameEngine/actions/UseEventCardAction";
import { ActivateMainEffectAction } from "../../../gameEngine/actions/ActivateMainEffectAction";
import { ResolveSelectedEffectAction } from "../../../gameEngine/actions/ResolveSelectedEffectAction";
import { ResolveTriggerChoiceAction } from "../../../gameEngine/actions/ResolveTriggerChoiceAction";

import type { PendingSelection } from "../types/PendingSelection";
import type { PendingActivateMain } from "../types/PendingInteraction";

type Props = {
  game: Game;
  pendingSelection: PendingSelection | null;
  pendingActivateMain: PendingActivateMain;
  setPendingSelection: Dispatch<SetStateAction<PendingSelection | null>>;
  setPendingActivateMain: Dispatch<SetStateAction<PendingActivateMain>>;
  refresh: () => void;
};

export function useTargetSelectionHandlers({
  game,
  pendingSelection,
  pendingActivateMain,
  setPendingSelection,
  setPendingActivateMain,
  refresh,
}: Props) {
  const player1 = game.player1;
  const player2 = game.player2;

  const findSelectableModifyBpAction = (sourceCard: CardInstance) => {
    for (const effect of sourceCard.card.effects) {
      for (const action of effect.actions) {
        if (action.type !== "modifyBpThisTurn") {
          continue;
        }

        if (typeof action.target === "string") {
          continue;
        }

        return action;
      }
    }

    return undefined;
  };

  const startModifyBpTargetSelection = (
    sourceCard: CardInstance
  ): boolean => {
    const action = findSelectableModifyBpAction(sourceCard);

    if (!action || action.type !== "modifyBpThisTurn") {
      return false;
    }

    if (typeof action.target === "string") {
      return false;
    }

    const target = action.target;

    setPendingSelection({
      source: "effect",
      sourceCard,
      requiredCount: target.maxCount ?? 1,
      selectedTargets: [],
      allowedSide:
        target.side === "own"
          ? "own"
          : target.side === "opponent"
            ? "opponent"
            : "both",
      allowedLines:
        target.zone === "frontLine"
          ? [BoardLine.FrontLine]
          : target.zone === "energyLine"
            ? [BoardLine.EnergyLine]
            : [BoardLine.FrontLine, BoardLine.EnergyLine],
    });

    return true;
  };

  const findOwnCardPosition = (
    target: CardInstance
  ): { line: BoardLine; index: number } | undefined => {
    for (let i = 0; i < player1.board.frontLine.length; i++) {
      if (player1.board.frontLine[i].getCard() === target) {
        return {
          line: BoardLine.FrontLine,
          index: i,
        };
      }
    }

    for (let i = 0; i < player1.board.energyLine.length; i++) {
      if (player1.board.energyLine[i].getCard() === target) {
        return {
          line: BoardLine.EnergyLine,
          index: i,
        };
      }
    }

    return undefined;
  };

  const handleSelectTarget = (
    side: "own" | "opponent",
    line: BoardLine,
    index: number
  ) => {
    if (!pendingSelection) return;

    if (
      pendingSelection.allowedSide !== "both" &&
      pendingSelection.allowedSide !== side
    ) {
      alert("選択できない対象です");
      return;
    }

    if (!pendingSelection.allowedLines.includes(line)) {
      alert("選択できないラインです");
      return;
    }

    const targetPlayer = side === "own" ? player1 : player2;
    const slots =
      line === BoardLine.FrontLine
        ? targetPlayer.board.frontLine
        : targetPlayer.board.energyLine;

    const selected = slots[index]?.getCard();

    if (!selected) {
      alert("対象カードがありません");
      return;
    }

    const nextSelectedTargets = [
      ...pendingSelection.selectedTargets,
      selected,
    ];

    if (nextSelectedTargets.length < pendingSelection.requiredCount) {
      setPendingSelection({
        ...pendingSelection,
        selectedTargets: nextSelectedTargets,
      });
      return;
    }

    try {
      if (pendingSelection.source === "event") {
        if (pendingSelection.handIndex === undefined) {
          throw new Error("Event handIndex is missing.");
        }

        UseEventCardAction.execute(
          game,
          pendingSelection.handIndex,
          nextSelectedTargets
        );
      }

      if (pendingSelection.source === "effect") {
        if (!pendingSelection.sourceCard) {
          throw new Error("Effect source card is missing.");
        }

        const effectAction = findSelectableModifyBpAction(
          pendingSelection.sourceCard
        );

        if (!effectAction) {
          throw new Error("Selectable effect action is missing.");
        }

        ResolveSelectedEffectAction.execute(
          game,
          pendingSelection.sourceCard,
          effectAction,
          nextSelectedTargets
        );

        setPendingSelection(null);
        refresh();
        return;
      }

      if (pendingSelection.source === "activateMain") {
        if (!pendingActivateMain) {
          throw new Error("ActivateMain source is missing.");
        }

        const selectedTarget = nextSelectedTargets[0];
        const targetPosition = findOwnCardPosition(selectedTarget);

        if (!targetPosition) {
          throw new Error("Selected target position not found.");
        }

        ActivateMainEffectAction.execute(
          game,
          pendingActivateMain.sourceLine,
          pendingActivateMain.sourceIndex,
          targetPosition.line,
          targetPosition.index
        );

        setPendingActivateMain(null);
      }

      if (pendingSelection.source === "trigger") {
        ResolveTriggerChoiceAction.execute(game, nextSelectedTargets);

        setPendingSelection(null);
        refresh();
        return;
      }

      setPendingSelection(null);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleCancelSelection = () => {
    setPendingSelection(null);
  };

  return {
    startModifyBpTargetSelection,
    handleSelectTarget,
    handleCancelSelection,
  };
}