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

type Props = {
  game: Game;
  player1: Player;
  isGameOver: boolean;
  pendingRaid: { handIndex: number } | null;
  pendingRaidBase: {
    handIndex: number;
    baseLine: BoardLine;
    baseIndex: number;
  } | null;
  pendingSelection: PendingSelection | null;
  pendingCardChoice: PendingCardChoice | null;
  pendingPlayDestination: {
    sourceCard: CardInstance;
    playedCard: CardInstance;
    allowedLines: BoardLine[];
    rest: boolean;
    playerId: string;
  } | null;
  isSelectingRaidTriggerBase: boolean;
  pendingRaidTriggerBase: {
    baseLine: BoardLine;
    baseIndex: number;
  } | null;

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

      <RaidTriggerBanner
        isOpen={
          game.pendingRaidTrigger?.playerId === player1.id &&
          !isSelectingRaidTriggerBase
        }
        onStartRaid={onStartRaidTrigger}
        onDeclineRaid={onDeclineRaidTrigger}
      />

      <TriggerChoiceBanner
        isOpen={
          game.pendingTriggerChoice?.playerId === player1.id &&
          !pendingSelection
        }
        onStartChoice={onStartTriggerChoice}
      />

      <RaidTriggerBaseSelectingBanner
        isOpen={
          game.pendingRaidTrigger?.playerId === player1.id &&
          isSelectingRaidTriggerBase &&
          pendingRaidTriggerBase === null
        }
      />

      <RaidTriggerDestinationModal
        pendingRaidTriggerBase={pendingRaidTriggerBase}
        frontSlotEmpty={player1.board.frontLine.map((slot) => slot.isEmpty())}
        onSelectDestination={onSelectRaidTriggerDestination}
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