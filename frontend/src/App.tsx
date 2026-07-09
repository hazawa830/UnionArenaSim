import { useEffect, useReducer, useRef, useState } from "react";
import "./App.css";

import { GameFactory } from "../../gameEngine/factory/GameFactory";
import { Game } from "../../gameEngine/core/Game";
import { CardInstance } from "../../gameEngine/cards/CardInstance";
import { BoardLine } from "../../gameEngine/enum/BoardLine";
import { GamePhase } from "../../gameEngine/enum/GamePhase";

import { RaidPlayAction } from "../../gameEngine/actions/RaidPlayAction";
import { UseEventCardAction } from "../../gameEngine/actions/UseEventCardAction";

import { OfficialBoardLayout } from "./components/OfficialBoardLayout";
import type { PendingCardChoice } from "./components/CardChoicePanel";
import { CardType } from "../../gameEngine/enum/CardType";
import { ActivateMainEffectAction } from "../../gameEngine/actions/ActivateMainEffectAction";
import { ResolveSelectedEffectAction } from "../../gameEngine/actions/ResolveSelectedEffectAction";
import { CompletePlayFromHandAction } from "../../gameEngine/actions/CompletePlayFromHandAction";
import { ResolveRaidTriggerAction } from "../../gameEngine/actions/ResolveRaidTriggerAction";
import { ResolveTriggerChoiceAction } from "../../gameEngine/actions/ResolveTriggerChoiceAction";
import { TriggerType } from "../../gameEngine/enum/TriggerType";
import { useCpuAutoPlay } from "./hooks/useCpuAutoPlay";

import { GameOverlays } from "./components/overlays/GameOverlays";
import type { PendingSelection } from "./types/PendingSelection";
import { usePlayHandlers } from "./hooks/usePlayHandlers";
import { useCombatHandlers } from "./hooks/useCombatHandlers";
import { usePhaseHandlers } from "./hooks/usePhaseHandlers";
import { useCardChoiceHandlers } from "./hooks/useCardChoiceHandlers";

function App() {
  const gameRef = useRef<Game>(GameFactory.createSampleGame());
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const [pendingAttack, setPendingAttack] = useState<number | null>(null);
  const [hoveredCardImage, setHoveredCardImage] = useState<string | null>(null);

  const [pendingRaid, setPendingRaid] = useState<{ handIndex: number } | null>(null);

  const [pendingRaidBase, setPendingRaidBase] = useState<{
    handIndex: number;
    baseLine: BoardLine;
    baseIndex: number;
  } | null>(null);
  const [isSelectingRaidTriggerBase, setIsSelectingRaidTriggerBase] =
    useState(false);

  const [pendingRaidTriggerBase, setPendingRaidTriggerBase] = useState<{
    baseLine: BoardLine;
    baseIndex: number;
  } | null>(null);
  const [pendingActivateMain, setPendingActivateMain] = useState<{
  sourceLine: BoardLine;
  sourceIndex: number;
} | null>(null);

  const [pendingSelection, setPendingSelection] =
    useState<PendingSelection | null>(null);
  const [pendingCardChoice, setPendingCardChoice] =
    useState<PendingCardChoice | null>(null);
  const [pendingPlayDestination, setPendingPlayDestination] = useState<{
    sourceCard: CardInstance;
    playedCard: CardInstance;
    allowedLines: BoardLine[];
    rest: boolean;
    playerId: string;
  } | null>(null);
  
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
  
  const handleStartRaid = (handIndex: number) => {
    if (!isYourTurn) return alert("相手ターンです");
    if (game.phase !== GamePhase.Main) return alert("メインフェーズのみです");

    setPendingRaid({ handIndex });
    setPendingRaidBase(null);
    setPendingSelection(null);
  };
  
  const handleSelectRaidBase = (baseLine: BoardLine, baseIndex: number) => {
    
    if (game.pendingRaidTrigger && isSelectingRaidTriggerBase) {
      handleSelectRaidTriggerBase(baseLine, baseIndex);
      return;
    }
    if (!pendingRaid) return;
    if (baseLine === BoardLine.FrontLine) {
      try {
        const raidCard =RaidPlayAction.execute(
          game,
          pendingRaid.handIndex,
          BoardLine.FrontLine,
          baseIndex,
          undefined,
          undefined,
          { skipPlayFromHand: true }
        );
        const startedChoice = startPlayFromHandChoice(raidCard, game.pendingRaidTrigger?.playerId ?? player1.id);
        
        if (!startedChoice) {
          refresh();
        }
        setPendingRaid(null);
        setPendingRaidBase(null);
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

      if (!startedChoice) {
        refresh();
      }
      setPendingRaid(null);
      setPendingRaidBase(null);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleCancelRaid = () => {
    setPendingRaid(null);
    setPendingRaidBase(null);
  };

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

const startModifyBpTargetSelection = (sourceCard: CardInstance): boolean => {
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
      const startedSearch = startSearchTopDeckChoice(eventCard, {handIndex,});

      if (startedSearch) {
        return;
      }
      UseEventCardAction.execute(game, handIndex);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
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
const handleStartActivateMain = (
  sourceLine: BoardLine,
  sourceIndex: number
) => {
  if (!isYourTurn) return alert("相手ターンです");
  if (game.phase !== GamePhase.Main) return alert("メインフェーズのみです");

  const sourceSlot =
    sourceLine === BoardLine.FrontLine
      ? player1.board.frontLine[sourceIndex]
      : player1.board.energyLine[sourceIndex];

  const sourceCard = sourceSlot.getCard();

  if (!sourceCard) {
    alert("カードがありません");
    return;
  }

  const activateMainEffect = sourceCard.card.effects.find(
    (effect) => effect.trigger === "activateMain"
  );

  if (!activateMainEffect) {
    alert("起動メイン効果がありません");
    return;
  }
  
  const needsSelectedOwnOtherCharacter = activateMainEffect.actions.some(
    (action: any) => action.target === "selectedOwnOtherCharacter"
  );

  if (needsSelectedOwnOtherCharacter) {
    setPendingActivateMain({
      sourceLine,
      sourceIndex,
    });

    setPendingSelection({
      source: "activateMain",
      requiredCount: 1,
      selectedTargets: [],
      allowedSide: "own",
      allowedLines: [BoardLine.FrontLine, BoardLine.EnergyLine],
    });

    return;
  }

  try {
    ActivateMainEffectAction.execute(game, sourceLine, sourceIndex);
    refresh();
  } catch (e) {
    alert(e instanceof Error ? e.message : String(e));
  }
};

  
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