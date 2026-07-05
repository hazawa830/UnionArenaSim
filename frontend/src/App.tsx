import { useEffect, useReducer, useRef, useState } from "react";
import "./App.css";

import { GameFactory } from "../../gameEngine/factory/GameFactory";
import { RandomCPU } from "../../gameEngine/cpu/RandomCPU";
import { Game } from "../../gameEngine/core/Game";
import { BoardLine } from "../../gameEngine/enum/BoardLine";
import { GamePhase } from "../../gameEngine/enum/GamePhase";

import { PlayCardAction } from "../../gameEngine/actions/PlayCardAction";
import { MoveCardAction } from "../../gameEngine/actions/MoveAction";
import { AttackAction } from "../../gameEngine/actions/AttackAction";
import { ExtraDrawAction } from "../../gameEngine/actions/ExtraDrawAction";
import { RaidPlayAction } from "../../gameEngine/actions/RaidPlayAction";

import { WinnerModal } from "./components/WinnerModal";
import { OfficialBoardLayout } from "./components/OfficialBoardLayout";
import { UseEventCardAction } from "../../gameEngine/actions/UseEventCardAction";

function App() {
  const gameRef = useRef<Game>(GameFactory.createSampleGame());
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const [pendingAttack, setPendingAttack] = useState<number | null>(null);
  const [hoveredCardImage, setHoveredCardImage] = useState<string | null>(null);

  const [pendingRaid, setPendingRaid] = useState<{ handIndex: number } | null>(
    null
  );

  const [pendingRaidBase, setPendingRaidBase] = useState<{
    handIndex: number;
    baseLine: BoardLine;
    baseIndex: number;
  } | null>(null);

  const game = gameRef.current;
  const player1 = game.player1;
  const player2 = game.player2;
  const currentPlayer = game.getCurrentPlayer();

  const isYourTurn = currentPlayer === player1;
  const isGameOver = game.winner !== undefined;

  const refresh = () => forceUpdate();

  useEffect(() => {
    if (game.winner) return;
    if (currentPlayer !== player2) return;
    if (pendingAttack !== null) return;
    if (pendingRaid !== null) return;
    if (pendingRaidBase !== null) return;

    const timer = setTimeout(() => {
      RandomCPU.playPhase(game);
      refresh();
    }, 700);

    return () => clearTimeout(timer);
  }, [
    game.phase,
    game.currentPlayerId,
    game.winner,
    pendingAttack,
    pendingRaid,
    pendingRaidBase,
  ]);

  const handleNewGame = () => {
    gameRef.current = GameFactory.createSampleGame();
    setPendingAttack(null);
    setPendingRaid(null);
    setPendingRaidBase(null);
    setHoveredCardImage(null);
    refresh();
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

  const handlePlayToEnergy = (handIndex: number) => {
    if (!isYourTurn) return alert("相手ターンです");

    try {
      PlayCardAction.execute(game, handIndex, BoardLine.EnergyLine);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handlePlayToFront = (handIndex: number) => {
    if (!isYourTurn) return alert("相手ターンです");

    try {
      PlayCardAction.execute(game, handIndex, BoardLine.FrontLine);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
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
  };

  const handleSelectRaidBase = (baseLine: BoardLine, baseIndex: number) => {
    if (!pendingRaid) return;

    if (baseLine === BoardLine.FrontLine) {
      try {
        RaidPlayAction.execute(
          game,
          pendingRaid.handIndex,
          BoardLine.FrontLine,
          baseIndex
        );

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
      RaidPlayAction.execute(
        game,
        pendingRaidBase.handIndex,
        pendingRaidBase.baseLine,
        pendingRaidBase.baseIndex,
        destinationIndex,
        destinationLine
      );

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
  const handleUseEvent = (handIndex: number) => {
    if (!isYourTurn) return alert("相手ターンです");
    if (game.phase !== GamePhase.Main) return alert("メインフェーズのみです");

    try {
      UseEventCardAction.execute(game, handIndex);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };
  return (
    <div className="app">
      <h1>Union Arena Simulator</h1>

      {isGameOver && (
        <WinnerModal winner={game.winner} onNewGame={handleNewGame} />
      )}

      {pendingRaid && !pendingRaidBase && (
        <div className="selection-banner">
          レイド元を選択してください
          <button onClick={handleCancelRaid}>Cancel</button>
        </div>
      )}

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
      />

      {pendingRaidBase && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>レイド登場先を選択</h3>

            <div className="raid-destination-buttons">
              <button
                onClick={() =>
                  handleSelectRaidDestination(
                    BoardLine.EnergyLine,
                    pendingRaidBase.baseIndex
                  )
                }
              >
                Energy Lineに登場
              </button>

              {player1.board.frontLine.map((slot, index) => (
                <button
                  key={index}
                  disabled={!slot.isEmpty()}
                  onClick={() =>
                    handleSelectRaidDestination(BoardLine.FrontLine, index)
                  }
                >
                  Front {index + 1}
                </button>
              ))}
            </div>

            <button onClick={handleCancelRaid}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;