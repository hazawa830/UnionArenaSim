import { useReducer, useRef, useState } from "react";
import "./App.css";
import { GameFactory } from "../../gameEngine/factory/GameFactory";
import { Game } from "../../gameEngine/core/Game";


import { OfficialBoardLayout } from "./components/OfficialBoardLayout";
import type { PendingCardChoice } from "./components/CardChoicePanel";
import { useCpuAutoPlay } from "./hooks/useCpuAutoPlay";
import { GameOverlays } from "./components/overlays/GameOverlays";
import type { PendingSelection } from "./types/PendingSelection";
import { usePlayHandlers } from "./hooks/usePlayHandlers";
import { useCombatHandlers } from "./hooks/useCombatHandlers";
import { usePhaseHandlers } from "./hooks/usePhaseHandlers";
import { useCardChoiceHandlers } from "./hooks/useCardChoiceHandlers";
import { useTargetSelectionHandlers } from "./hooks/useTargetSelectionHandlers";
import { useEventHandlers } from "./hooks/useEventHandlers";
import { useTriggerHandlers } from "./hooks/useTriggerHandlers";
import { useRaidHandlers } from "./hooks/useRaidHandlers";
import { useActivateMainHandlers } from "./hooks/useActivateMainHandlers";
import type {
  PendingRaid,
  PendingRaidBase,
  PendingRaidTriggerBase,
  PendingActivateMain,
  PendingPlayDestination,
} from "./types/PendingInteraction";
function App() {
  const gameRef = useRef<Game>(GameFactory.createSampleGame());
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const [pendingAttack, setPendingAttack] = useState<number | null>(null);
  const [hoveredCardImage, setHoveredCardImage] = useState<string | null>(null);

  const [pendingRaid, setPendingRaid] = useState<PendingRaid>(null);

  const [pendingRaidBase, setPendingRaidBase] =
    useState<PendingRaidBase>(null);

  const [pendingRaidTriggerBase, setPendingRaidTriggerBase] =
    useState<PendingRaidTriggerBase>(null);

  const [pendingActivateMain, setPendingActivateMain] =
    useState<PendingActivateMain>(null);

  const [pendingPlayDestination, setPendingPlayDestination] =
    useState<PendingPlayDestination>(null);
  const [isSelectingRaidTriggerBase, setIsSelectingRaidTriggerBase] =
    useState(false);

  const [pendingSelection, setPendingSelection] =
    useState<PendingSelection | null>(null);
  const [pendingCardChoice, setPendingCardChoice] =
    useState<PendingCardChoice | null>(null);

  
  const game = gameRef.current;
  const player1 = game.player1;
  const player2 = game.player2;
  const currentPlayer = game.getCurrentPlayer();
  const isYourTurn = currentPlayer === player1;
  const isGameOver = game.winner !== undefined;
  const [cpuTick, setCpuTick] = useState(0);
  
  const refresh = () => forceUpdate();
  
  const {
    startPlayFromHandChoice,
    startSearchTopDeckChoice,
    handleToggleChoiceCard,
    handleConfirmCardChoice,
    handleCancelCardChoice,
    handleSelectPlayFromHandDestination,
  } = useCardChoiceHandlers({
    game,
    pendingCardChoice,
    pendingPlayDestination,
    pendingActivateMain,
    setPendingCardChoice,
    setPendingPlayDestination,
    setPendingActivateMain,
    refresh,
  });
  const {
    handleStartTriggerChoice,
    handleDeclineTriggerChoice,
    handleDeclineRaidTrigger,
    handleStartRaidTrigger,
    handleSelectRaidTriggerBase,
    handleSelectRaidTriggerDestination,
  } = useTriggerHandlers({
    game,
    pendingRaidTriggerBase,
    setIsSelectingRaidTriggerBase,
    setPendingRaidTriggerBase,
    setPendingSelection,
    startPlayFromHandChoice,
    refresh,
  });
  const {
    handleStartRaid,
    handleSelectRaidBase,
    handleSelectRaidDestination,
    handleCancelRaid,
  } = useRaidHandlers({
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
  });
  const { handleStartActivateMain } = useActivateMainHandlers({
    game,
    isYourTurn,
    setPendingActivateMain,
    setPendingSelection,
    setPendingCardChoice,
    refresh,
  });
  useCpuAutoPlay({
    game,
    player1Id: player1.id,
    player2Id: player2.id,
    currentPlayerId: currentPlayer.id,
    pendingAttack,
    pendingRaid,
    pendingRaidBase,
    pendingSelection,
    pendingCardChoice,
    pendingActivateMain,
    pendingPlayDestination,
    isSelectingRaidTriggerBase,
    pendingRaidTriggerBase,
    cpuTick,
    setCpuTick,
    setPendingAttack,
    refresh,
  });
  const { handleUseEvent } = useEventHandlers({
    game,
    isYourTurn,
    setPendingSelection,
    startSearchTopDeckChoice,
    refresh,
  });
  const {
    startModifyBpTargetSelection,
    handleSelectTarget,
    handleCancelSelection,
  } = useTargetSelectionHandlers({
    game,
    pendingSelection,
    pendingActivateMain,
    setPendingSelection,
    setPendingActivateMain,
    refresh,
  });
  const handleNewGame = () => {
    gameRef.current = GameFactory.createSampleGame();
    setPendingAttack(null);
    setPendingRaid(null);
    setPendingRaidBase(null);
    setPendingSelection(null);
    setHoveredCardImage(null);
    refresh();
    setPendingCardChoice(null);
    setPendingActivateMain(null);
    setPendingPlayDestination(null);
    setIsSelectingRaidTriggerBase(false);
    setPendingRaidTriggerBase(null);
  };

  const { handleNextPhase, handleExtraDraw } = usePhaseHandlers({
    game,
    isYourTurn,
    refresh,
  });
  
const { handleAttack, handleNoBlock, handleBlock } = useCombatHandlers({
    game,
    isYourTurn,
    pendingAttack,
    setPendingAttack,
    refresh,
  });
const {
    handlePlayToEnergy,
    handlePlayToFront,
    handleMoveToFront,
  } = usePlayHandlers({
    game,
    isYourTurn,
    refresh,
    startModifyBpTargetSelection,
    startSearchTopDeckChoice,
  });
  return (
    <div className="app">
      <h1>Union Arena Simulator</h1>
      <GameOverlays
        game={game}
        player1={player1}
        isGameOver={isGameOver}
        pendingRaid={pendingRaid}
        pendingRaidBase={pendingRaidBase}
        pendingSelection={pendingSelection}
        pendingCardChoice={pendingCardChoice}
        pendingPlayDestination={pendingPlayDestination}
        isSelectingRaidTriggerBase={isSelectingRaidTriggerBase}
        pendingRaidTriggerBase={pendingRaidTriggerBase}
        onNewGame={handleNewGame}
        onCancelRaid={handleCancelRaid}
        onCancelSelection={handleCancelSelection}
        onSelectRaidDestination={handleSelectRaidDestination}
        onSelectPlayFromHandDestination={handleSelectPlayFromHandDestination}
        onStartRaidTrigger={handleStartRaidTrigger}
        onDeclineRaidTrigger={handleDeclineRaidTrigger}
        onStartTriggerChoice={handleStartTriggerChoice}
        onSelectRaidTriggerDestination={handleSelectRaidTriggerDestination}
        onDeclineTriggerChoice={handleDeclineTriggerChoice}
      />
      <OfficialBoardLayout
        game={game}
        player1={player1}
        player2={player2}
        currentPlayer={currentPlayer}
        isYourTurn={isYourTurn}
        isGameOver={isGameOver}
        pendingAttack={pendingAttack}
        pendingRaid={pendingRaid}
        pendingRaidBase={pendingRaidBase}
        pendingSelection={pendingSelection}
        hoveredCardImage={hoveredCardImage}
        onHoverImage={setHoveredCardImage}
        onNextPhase={handleNextPhase}
        onExtraDraw={handleExtraDraw}
        onMoveToFront={handleMoveToFront}
        onAttack={handleAttack}
        onPlayToEnergy={handlePlayToEnergy}
        onPlayToFront={handlePlayToFront}
        onStartRaid={handleStartRaid}
        onSelectRaidBase={handleSelectRaidBase}
        onNoBlock={handleNoBlock}
        onBlock={handleBlock}
        onUseEvent={handleUseEvent}
        onSelectTarget={handleSelectTarget}
        pendingCardChoice={pendingCardChoice}
        onToggleChoiceCard={handleToggleChoiceCard}
        onConfirmCardChoice={handleConfirmCardChoice}
        onCancelCardChoice={handleCancelCardChoice}
        onStartActivateMain={handleStartActivateMain}
        canCancelCardChoice={
          pendingCardChoice?.source !== "discardHand" 
        }
        isRaidTriggerBaseSelecting={isSelectingRaidTriggerBase}
      />
    </div>
  );
}

export default App;