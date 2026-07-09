import type { Dispatch, SetStateAction } from "react";

import type { Game } from "../../../gameEngine/core/Game";
import type { CardInstance } from "../../../gameEngine/cards/CardInstance";
import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { GamePhase } from "../../../gameEngine/enum/GamePhase";
import { RaidPlayAction } from "../../../gameEngine/actions/RaidPlayAction";

import type { PendingSelection } from "../types/PendingSelection";
import type {
  PendingRaid,
  PendingRaidBase,
} from "../types/PendingInteraction";

type Props = {
  game: Game;
  isYourTurn: boolean;
  pendingRaid: PendingRaid;
  pendingRaidBase: PendingRaidBase;
  isSelectingRaidTriggerBase: boolean;
  setPendingRaid: Dispatch<SetStateAction<PendingRaid>>;
  setPendingRaidBase: Dispatch<SetStateAction<PendingRaidBase>>;
  setPendingSelection: Dispatch<SetStateAction<PendingSelection | null>>;
  startPlayFromHandChoice: (
    sourceCard: CardInstance,
    playerId?: string
  ) => boolean;
  handleSelectRaidTriggerBase: (
    baseLine: BoardLine,
    baseIndex: number
  ) => void;
  refresh: () => void;
};

export function useRaidHandlers({
  game,
  isYourTurn,
  pendingRaid,
  pendingRaidBase,
  isSelectingRaidTriggerBase,
  setPendingRaid,
  setPendingRaidBase,
  setPendingSelection,
  startPlayFromHandChoice,
  handleSelectRaidTriggerBase,
  refresh,
}: Props) {
  const player1 = game.player1;

  const handleStartRaid = (handIndex: number) => {
    if (!isYourTurn) return alert("相手ターンです");
    if (game.phase !== GamePhase.Main) return alert("メインフェーズのみです");

    setPendingRaid({ handIndex });
    setPendingRaidBase(null);
    setPendingSelection(null);
  };

  const handleSelectRaidBase = (
    baseLine: BoardLine,
    baseIndex: number
  ) => {
    if (game.pendingRaidTrigger && isSelectingRaidTriggerBase) {
      handleSelectRaidTriggerBase(baseLine, baseIndex);
      return;
    }

    if (!pendingRaid) return;

    if (baseLine === BoardLine.FrontLine) {
      try {
        const raidCard = RaidPlayAction.execute(
          game,
          pendingRaid.handIndex,
          BoardLine.FrontLine,
          baseIndex,
          undefined,
          undefined,
          { skipPlayFromHand: true }
        );

        const startedChoice = startPlayFromHandChoice(
          raidCard,
          game.pendingRaidTrigger?.playerId ?? player1.id
        );

        setPendingRaid(null);
        setPendingRaidBase(null);

        if (!startedChoice) {
          refresh();
          return;
        }

        refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : String(e));
      }

      return;
    }

    setPendingRaidBase({
      handIndex: pendingRaid.handIndex,
      baseLine,
      baseIndex,
    });
  };

  const handleSelectRaidDestination = (
    destinationLine: BoardLine,
    destinationIndex: number
  ) => {
    if (!pendingRaidBase) return;

    try {
      const raidCard = RaidPlayAction.execute(
        game,
        pendingRaidBase.handIndex,
        pendingRaidBase.baseLine,
        pendingRaidBase.baseIndex,
        destinationIndex,
        destinationLine,
        { skipPlayFromHand: true }
      );

      const startedChoice = startPlayFromHandChoice(raidCard);

      setPendingRaid(null);
      setPendingRaidBase(null);

      if (!startedChoice) {
        refresh();
        return;
      }

      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleCancelRaid = () => {
    setPendingRaid(null);
    setPendingRaidBase(null);
  };

  return {
    handleStartRaid,
    handleSelectRaidBase,
    handleSelectRaidDestination,
    handleCancelRaid,
  };
}