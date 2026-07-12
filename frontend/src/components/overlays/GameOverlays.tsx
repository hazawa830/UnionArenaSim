import { BoardLine } from "../../../../gameEngine/enum/BoardLine";
import { Player } from "../../../../gameEngine/core/Player";
import { Game } from "../../../../gameEngine/core/Game";
import type { CardInstance } from "../../../../gameEngine/cards/CardInstance";
import type { PendingCardChoice } from "../CardChoicePanel";
import { WinnerModal } from "../WinnerModal";
import { RaidDestinationModal } from "./RaidDestinationModal";
import { PlayDestinationModal } from "./PlayDestinationModal";
import { RaidTriggerBanner } from "./RaidTriggerBanner";
import { TriggerChoiceBanner } from "./TriggerChoiceBanner";
import { SelectionBanner } from "./SelectionBanner";
import { RaidTriggerDestinationModal } from "./RaidTriggerDestinationModal";
import { RaidTriggerBaseSelectingBanner } from "./RaidTriggerBaseSelectingBanner";
import type { PendingSelection } from "../../types/PendingSelection";
import type {
  PendingRaid,
  PendingRaidBase,
  PendingRaidTriggerBase,
  PendingPlayDestination,
} from "../../types/PendingInteraction";

type Props = {
  game: Game;
  player1: Player;
  isGameOver: boolean;
  pendingRaid: { handIndex: number } | null;
  pendingRaidBase: PendingRaidBase;
  pendingSelection: PendingSelection | null;
  pendingCardChoice: PendingCardChoice | null;
  pendingPlayDestination: PendingPlayDestination;
  isSelectingRaidTriggerBase: boolean;
  pendingRaidTriggerBase: PendingRaidTriggerBase;
  onDeclineTriggerChoice: () => void;

  onNewGame: () => void;
  onCancelRaid: () => void;
  onCancelSelection: () => void;
  onSelectRaidDestination: (
    destinationLine: BoardLine,
    destinationIndex: number
  ) => void;
  onSelectPlayFromHandDestination: (destinationLine: BoardLine) => void;
  onStartRaidTrigger: () => void;
  onDeclineRaidTrigger: () => void;
  onStartTriggerChoice: () => void;
  onSelectRaidTriggerDestination: (
    destinationLine: BoardLine,
    destinationIndex?: number
  ) => void;
};

export function GameOverlays({
  game,
  player1,
  isGameOver,
  pendingRaid,
  pendingRaidBase,
  pendingSelection,
  pendingCardChoice,
  pendingPlayDestination,
  isSelectingRaidTriggerBase,
  pendingRaidTriggerBase,

  onNewGame,
  onCancelRaid,
  onCancelSelection,
  onSelectRaidDestination,
  onSelectPlayFromHandDestination,
  onStartRaidTrigger,
  onDeclineRaidTrigger,
  onStartTriggerChoice,
  onSelectRaidTriggerDestination,
  onDeclineTriggerChoice,
}: Props) {
  return (
    <>
      {isGameOver && (
        <WinnerModal winner={game.winner} onNewGame={onNewGame} />
      )}

      <SelectionBanner
        raidBaseSelecting={pendingRaid !== null && pendingRaidBase === null}
        targetSelecting={pendingSelection !== null}
        selectedCount={pendingSelection?.selectedTargets.length ?? 0}
        requiredCount={pendingSelection?.requiredCount ?? 0}
        onCancelRaid={onCancelRaid}
        onCancelSelection={onCancelSelection}
      />

      <RaidDestinationModal
        pendingRaidBase={pendingRaidBase}
        frontSlotEmpty={player1.board.frontLine.map((slot) => slot.isEmpty())}
        onSelectDestination={onSelectRaidDestination}
        onCancel={onCancelRaid}
      />

      

      

      <RaidTriggerBaseSelectingBanner
        isOpen={
          game.pendingRaidTrigger?.playerId === player1.id &&
          isSelectingRaidTriggerBase &&
          pendingRaidTriggerBase === null
        }
      />

      <PlayDestinationModal
        isOpen={pendingPlayDestination !== null}
        allowedLines={pendingPlayDestination?.allowedLines ?? []}
        canPlayToFront={Boolean(player1.board.getEmptyFrontSlot())}
        canPlayToEnergy={Boolean(player1.board.getEmptyEnergySlot())}
        onSelectDestination={onSelectPlayFromHandDestination}
      />
    </>
  );
}