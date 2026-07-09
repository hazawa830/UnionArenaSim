import type { Dispatch, SetStateAction } from "react";

import type { Game } from "../../../gameEngine/core/Game";
import type { CardInstance } from "../../../gameEngine/cards/CardInstance";
import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { TriggerType } from "../../../gameEngine/enum/TriggerType";
import { ResolveRaidTriggerAction } from "../../../gameEngine/actions/ResolveRaidTriggerAction";

import type { PendingSelection } from "../types/PendingSelection";
import type { PendingRaidTriggerBase } from "../types/PendingInteraction";



type Props = {
  game: Game;
  pendingRaidTriggerBase: PendingRaidTriggerBase;
  setIsSelectingRaidTriggerBase: Dispatch<SetStateAction<boolean>>;
  setPendingRaidTriggerBase: Dispatch<
    SetStateAction<PendingRaidTriggerBase>
  >;
  setPendingSelection: Dispatch<SetStateAction<PendingSelection | null>>;
  startPlayFromHandChoice: (
    sourceCard: CardInstance,
    playerId?: string
  ) => boolean;
  refresh: () => void;
};

export function useTriggerHandlers({
  game,
  pendingRaidTriggerBase,
  setIsSelectingRaidTriggerBase,
  setPendingRaidTriggerBase,
  setPendingSelection,
  startPlayFromHandChoice,
  refresh,
}: Props) {
  const handleStartTriggerChoice = () => {
    const pending = game.pendingTriggerChoice;
    if (!pending) return;

    if (pending.triggerType === TriggerType.Active) {
      setPendingSelection({
        source: "trigger",
        requiredCount: 1,
        selectedTargets: [],
        allowedSide: "own",
        allowedLines: [BoardLine.FrontLine],
      });
      return;
    }

    if (pending.triggerType === TriggerType.Special) {
      setPendingSelection({
        source: "trigger",
        requiredCount: 1,
        selectedTargets: [],
        allowedSide: "opponent",
        allowedLines: [BoardLine.FrontLine],
      });
      return;
    }

    alert("未対応のトリガー選択です");
  };

  const handleDeclineRaidTrigger = () => {
    try {
      ResolveRaidTriggerAction.execute(game, false);

      setIsSelectingRaidTriggerBase(false);
      setPendingRaidTriggerBase(null);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleStartRaidTrigger = () => {
    setIsSelectingRaidTriggerBase(true);
  };

  const handleSelectRaidTriggerBase = (
    baseLine: BoardLine,
    baseIndex: number
  ) => {
    if (!game.pendingRaidTrigger) return;

    if (baseLine === BoardLine.FrontLine) {
      try {
        const raidTriggerPlayerId = game.pendingRaidTrigger.playerId;

        const raidCard = ResolveRaidTriggerAction.execute(
          game,
          true,
          BoardLine.FrontLine,
          baseIndex,
          BoardLine.FrontLine,
          undefined,
          { skipPlayFromHand: true }
        );

        setIsSelectingRaidTriggerBase(false);
        setPendingRaidTriggerBase(null);

        if (raidCard && startPlayFromHandChoice(raidCard, raidTriggerPlayerId)) {
          refresh();
          return;
        }

        refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : String(e));
      }

      return;
    }

    setPendingRaidTriggerBase({
      baseLine,
      baseIndex,
    });
  };

  const handleSelectRaidTriggerDestination = (
    destinationLine: BoardLine,
    destinationIndex?: number
  ) => {
    if (!pendingRaidTriggerBase) return;
    if (!game.pendingRaidTrigger) return;

    const raidTriggerPlayerId = game.pendingRaidTrigger.playerId;

    try {
      const raidCard = ResolveRaidTriggerAction.execute(
        game,
        true,
        pendingRaidTriggerBase.baseLine,
        pendingRaidTriggerBase.baseIndex,
        destinationLine,
        destinationIndex,
        { skipPlayFromHand: true }
      );

      setIsSelectingRaidTriggerBase(false);
      setPendingRaidTriggerBase(null);

      if (raidCard && startPlayFromHandChoice(raidCard, raidTriggerPlayerId)) {
        refresh();
        return;
      }

      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  return {
    handleStartTriggerChoice,
    handleDeclineRaidTrigger,
    handleStartRaidTrigger,
    handleSelectRaidTriggerBase,
    handleSelectRaidTriggerDestination,
  };
}