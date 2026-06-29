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

import { PlayerView } from "./components/PlayerView";
import { HandView } from "./components/HandView";
import { BlockPanel } from "./components/BlockPanel";
import { WinnerModal } from "./components/WinnerModal";
import { CompactPlayerInfo } from "./components/CompactPlayerInfo";

function App() {
  const gameRef = useRef<Game>(GameFactory.createSampleGame());
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [pendingAttack, setPendingAttack] = useState<number | null>(null);
  const [hoveredCardImage, setHoveredCardImage] = useState<string | null>(null);

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

    const timer = setTimeout(() => {
      if (game.phase === GamePhase.Attack) {
        const attackerIndex = player2.board.frontLine.findIndex((slot) => {
          const card = slot.getCard();
          return card && !card.isRest;
        });

        if (attackerIndex !== -1) {
          setPendingAttack(attackerIndex);
          return;
        }
      }

      RandomCPU.playPhase(game);
      refresh();
    }, 1000);

    return () => clearTimeout(timer);
  }, [game.phase, game.currentPlayerId, game.winner, pendingAttack]);

  const handleNewGame = () => {
    gameRef.current = GameFactory.createSampleGame();
    setPendingAttack(null);
    setHoveredCardImage(null);
    refresh();
  };

  const handleNextPhase = () => {
    game.nextPhase();
    refresh();
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
      const blockerIndex = RandomCPU.chooseBlockerIndex(game);
      AttackAction.execute(game, frontIndex, blockerIndex);
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

      <div className="game-layout">
        <aside className="side-panel">
          <CompactPlayerInfo title="Opponent" player={player2} />
        </aside>

        <main className="battlefield">
          <PlayerView
            title="Opponent"
            player={player2}
            reverseLines
            onHoverImage={setHoveredCardImage}
          />

          <hr />

          {pendingAttack !== null && (
            <BlockPanel
              attackerIndex={pendingAttack}
              player={player1}
              isGameOver={isGameOver}
              onNoBlock={handleNoBlock}
              onBlock={handleBlock}
            />
          )}

          <PlayerView
            title="You"
            player={player1}
            isYou
            onMoveToFront={handleMoveToFront}
            onAttack={handleAttack}
            onHoverImage={setHoveredCardImage}
          />

          <HandView
            player={player1}
            isYourTurn={isYourTurn}
            isGameOver={isGameOver}
            onPlayToEnergy={handlePlayToEnergy}
            onPlayToFront={handlePlayToFront}
            onHoverImage={setHoveredCardImage}
          />
        </main>

        <aside className="side-panel">
          <section className="control-panel">
            <h2>Game</h2>
            <div><strong>Phase: {game.phase}</strong></div>
            <div><strong>Turn: {game.turnCount}</strong></div>
            <div><strong>Current: {currentPlayer.name}</strong></div>
            <div><strong>Winner: {game.winner ?? "-"}</strong></div>

            <button onClick={handleNextPhase} disabled={isGameOver}>
              Next Phase
            </button>

            {isYourTurn && game.phase === GamePhase.Start && (
              <button onClick={handleExtraDraw} disabled={isGameOver}>
                Extra Draw - AP1
              </button>
            )}
          </section>

          <CompactPlayerInfo title="You" player={player1} />

          {hoveredCardImage && (
            <section className="hover-card-preview">
              <img
                src={hoveredCardImage}
                className="card-preview-image"
                alt="card preview"
              />
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

export default App;
