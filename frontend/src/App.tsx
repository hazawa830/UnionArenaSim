import { useEffect, useReducer, useRef, useState } from "react";
import "./App.css";

import { GameFactory } from "../../gameEngine/factory/GameFactory";
import { RandomCPU } from "../../gameEngine/cpu/RandomCPU";
import { Game } from "../../gameEngine/core/Game";
import { CardInstance } from "../../gameEngine/cards/CardInstance";
import { BoardLine } from "../../gameEngine/enum/BoardLine";
import { GamePhase } from "../../gameEngine/enum/GamePhase";

import { PlayCardAction } from "../../gameEngine/actions/PlayCardAction";
import { MoveCardAction } from "../../gameEngine/actions/MoveAction";
import { AttackAction } from "../../gameEngine/actions/AttackAction";
import { ExtraDrawAction } from "../../gameEngine/actions/ExtraDrawAction";
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
type PendingSelection = {
  source: "event" | "activateMain" | "trigger" | "effect";
  handIndex?: number;
  requiredCount: number;
  selectedTargets: CardInstance[];
  allowedSide: "own" | "opponent" | "both";
  allowedLines: BoardLine[];
  sourceCard?: CardInstance;
};

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

  const handleNextPhase = () => {
    if (!isYourTurn) return alert("相手ターンです");

    try {
      game.nextPhase();
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleExtraDraw = () => {
    if (!isYourTurn) return alert("相手ターンです");

    try {
      ExtraDrawAction.execute(game);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };
  const handlePlayCard = (
  handIndex: number,
  destinationLine: BoardLine
) => {
  if (!isYourTurn) return alert("相手ターンです");

  try {
    const playedCard = PlayCardAction.execute(
      game,
      handIndex,
      destinationLine,
      undefined,
      {
        skipSelectableModifyBp: true,
      }
    );

    if (startModifyBpTargetSelection(playedCard)) {
      return;
    }

    const startedSearch = startSearchTopDeckChoice(playedCard);

    if (!startedSearch) {
      refresh();
    }
  } catch (e) {
    alert(e instanceof Error ? e.message : String(e));
  }
};
  const handlePlayToEnergy = (handIndex: number) => {
    handlePlayCard(handIndex, BoardLine.EnergyLine);
  };

  const handlePlayToFront = (handIndex: number) => {
    handlePlayCard(handIndex, BoardLine.FrontLine);
  };

  const handleMoveToFront = (energyIndex: number) => {
    if (!isYourTurn) return alert("相手ターンです");

    const emptyFrontIndex = player1.board.frontLine.findIndex((slot) =>
      slot.isEmpty()
    );

    if (emptyFrontIndex === -1) {
      alert("フロントラインに空きがありません");
      return;
    }

    try {
      MoveCardAction.execute(
        game,
        BoardLine.EnergyLine,
        energyIndex,
        BoardLine.FrontLine,
        emptyFrontIndex
      );
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleAttack = (frontIndex: number) => {
    if (!isYourTurn) return alert("相手ターンです");

    try {
      AttackAction.execute(game, frontIndex);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleNoBlock = () => {
    if (pendingAttack === null) return;

    try {
      AttackAction.execute(game, pendingAttack);
      setPendingAttack(null);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleBlock = (blockerIndex: number) => {
    if (pendingAttack === null) return;

    try {
      AttackAction.execute(game, pendingAttack, blockerIndex);
      setPendingAttack(null);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleStartRaid = (handIndex: number) => {
    if (!isYourTurn) return alert("相手ターンです");
    if (game.phase !== GamePhase.Main) return alert("メインフェーズのみです");

    setPendingRaid({ handIndex });
    setPendingRaidBase(null);
    setPendingSelection(null);
  };
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
    const startPlayFromHandChoice = (sourceCard: CardInstance,playerId: string = player1.id): boolean => {
      const playFromHandAction = sourceCard.card.raidEffects
        .flatMap((effect) => effect.actions)
        .find((action: any) => action.type === "playFromHand");

      if (!playFromHandAction || playFromHandAction.type !== "playFromHand") {
        return false;
      }
      const choicePlayer =playerId === player1.id ? player1 : player2;

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
    const selectedCards = pendingCardChoice.selectedCards;
    const shownCards = pendingCardChoice.cards;

    for (const selected of selectedCards) {
      player1.board.hand.push(selected);
    }

    player1.board.deck = player1.board.deck.filter(
      (deckCard) => !shownCards.includes(deckCard)
    );

    const restCards = shownCards.filter(
      (card) => !selectedCards.includes(card)
    );

    player1.board.deck.unshift(...restCards);

    if (selectedCards.length > 0) {
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
    const discardedCards = pendingCardChoice.selectedCards;

    for (const discarded of discardedCards) {
      player1.board.hand = player1.board.hand.filter(
        (handCard) => handCard !== discarded
      );

      player1.board.trash.push(discarded);
    }

    if (pendingActivateMain) {
      try {
        ActivateMainEffectAction.execute(
          game,
          pendingActivateMain.sourceLine,
          pendingActivateMain.sourceIndex
        );

        setPendingActivateMain(null);
        setPendingCardChoice(null);
        refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : String(e));
      }

      return;
    }

    setPendingCardChoice(null);
    refresh();
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
const handleSelectPlayFromHandDestination = (destinationLine: BoardLine) => {
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

  const handleCancelCardChoice = () => {
    setPendingCardChoice(null);
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