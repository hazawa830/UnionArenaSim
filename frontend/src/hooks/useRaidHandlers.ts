import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { GamePhase } from "../../../gameEngine/enum/GamePhase";
import { RaidPlayAction } from "../../../gameEngine/actions/RaidPlayAction";
import type { Game } from "../../../gameEngine/core/Game";
import type { CardInstance } from "../../../gameEngine/cards/CardInstance";

type PendingRaid = { handIndex: number } | null;

type PendingRaidBase =
  | {
      handIndex: number;
      baseLine: BoardLine;
      baseIndex: number;
    }
  | null;

type Props = {
  game: Game;
  isYourTurn: boolean;
  pendingRaid: PendingRaid;
  pendingRaidBase: PendingRaidBase;
  setPendingRaid: React.Dispatch<React.SetStateAction<PendingRaid>>;
  setPendingRaidBase: React.Dispatch<React.SetStateAction<PendingRaidBase>>;
  setPendingSelection: React.Dispatch<React.SetStateAction<any>>;
  refresh: () => void;
  startPlayFromHandChoice: (
    sourceCard: CardInstance,
    playerId?: string
  ) => boolean;
  onSelectRaidTriggerBase: (baseLine: BoardLine, baseIndex: number) => void;
  isSelectingRaidTriggerBase: boolean;
};

export function useRaidHandlers({
  game,
  isYourTurn,
  pendingRaid,
  pendingRaidBase,
  setPendingRaid,
  setPendingRaidBase,
  setPendingSelection,
  refresh,
  startPlayFromHandChoice,
  onSelectRaidTriggerBase,
  isSelectingRaidTriggerBase,
}: Props) {
  const player1 = game.player1;

  const handleStartRaid = (handIndex: number) => {
    if (!isYourTurn) return alert("相手ターンです");
    if (game.phase !== GamePhase.Main) return alert("メインフェーズのみです");

    setPendingRaid({ handIndex });
    setPendingRaidBase(null);
    setPendingSelection(null);
  };

  const handleSelectRaidBase = (baseLine: BoardLine, baseIndex: number) => {
    if (game.pendingRaidTrigger && isSelectingRaidTriggerBase) {
      onSelectRaidTriggerBase(baseLine, baseIndex);
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
        } else {
          refresh();
        }
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
      } else {
        refresh();
      }
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