import {useEffect, useReducer, useRef } from "react";
import "./App.css";

import { GameFactory } from "../../gameEngine/factory/GameFactory";
import { RandomCPU } from "../../gameEngine/cpu/RandomCPU";
import { Game } from "../../gameEngine/core/Game";
import { BoardLine } from "../../gameEngine/enum/BoardLine";
import { PlayCardAction } from "../../gameEngine/actions/PlayCardAction";

function App() {
  const gameRef = useRef<Game>(GameFactory.createSampleGame());
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const game = gameRef.current;

  const player1 = game.player1; // 自分固定
  const player2 = game.player2; // 相手固定
  const currentPlayer = game.getCurrentPlayer();
  const isYourTurn = currentPlayer === player1;
  
  useEffect(() => {
    if (game.winner) {
      return;
    }

    if (currentPlayer !== player2) {
      return;
    }

    const timer = setTimeout(() => {
      RandomCPU.playPhase(game);
      refresh();
    }, 1000);

    return () => clearTimeout(timer);
  }, [game.phase, game.currentPlayerId, game.winner]);

  const refresh = () => forceUpdate();

  const handleNextPhase = () => {
    game.nextPhase();
    refresh();
  };

  const handleCpuAction = () => {
    RandomCPU.playPhase(game);
    refresh();
  };

  const handlePlayToEnergy = (handIndex: number) => {
    if (!isYourTurn) {
      alert("相手ターンです");
      return;
    }

    try {
      PlayCardAction.execute(game, handIndex, BoardLine.EnergyLine);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handlePlayToFront = (handIndex: number) => {
    if (!isYourTurn) {
      alert("相手ターンです");
      return;
    }

    try {
      PlayCardAction.execute(game, handIndex, BoardLine.FrontLine);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="app">
      <h1>Union Arena Simulator</h1>

      <section className="info">
        <div>Phase: {game.phase}</div>
        <div>Turn: {game.turnCount}</div>
        <div>Current Player: {currentPlayer.name}</div>
        <div>Winner: {game.winner ?? "-"}</div>
      </section>

      <div>
        <button onClick={handleNextPhase}>Next Phase</button>
        <button onClick={handleCpuAction}>CPU Action</button>
      </div>

      <PlayerView title="Opponent" player={player2} />

      <hr />

      <PlayerView title="You" player={player1} />

      <section>
        <h2>Your Hand</h2>
        {!isYourTurn && <p>相手ターン中です。自分のカードは操作できません。</p>}

        <div className="hand">
          {player1.board.hand.map((card, index) => (
            <div className="card" key={card.instanceId}>
              <div>{card.card.name}</div>
              <button onClick={() => handlePlayToEnergy(index)}>Energy</button>
              <button onClick={() => handlePlayToFront(index)}>Front</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
function SlotView({ slot }: { slot: any }) {
  const card = slot.getCard();

  return (
    <div className={`slot ${card?.isRest ? "rest" : "active"}`}>
      <div>{card ? card.card.name : "-"}</div>
      {card && (
        <div className="card-status">
          {card.isRest ? "REST" : "ACTIVE"}
        </div>
      )}
    </div>
  );
}
function PlayerView({
  title,
  player,
}: {
  title: string;
  player: ReturnType<Game["getCurrentPlayer"]>;
}) {
  return (
    <section className="player">
      <h2>
        {title}: {player.name}
      </h2>

      <div className="status">
        <span>Hand: {player.board.hand.length}</span>
        <span>Deck: {player.board.deck.length}</span>
        <span>Life: {player.board.lifeArea.length}</span>
        <span>
          AP: {player.board.activeActionPoint}/{player.board.maxActionPoint}
        </span>
      </div>

      <h3>Front Line</h3>
      <div className="line">
        {player.board.frontLine.map((slot, index) => {
          const card = slot.getCard();

          return (
            <div className={`slot ${card?.isRest ? "rest" : "active"}`} key={index}>
              <div>{card ? card.card.name : "-"}</div>
              {card && (
                <div className="card-status">
                  {card.isRest ? "REST" : "ACTIVE"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h3>Energy Line</h3>
      <div className="line">
        {player.board.energyLine.map((slot, index) => {
          const card = slot.getCard();

          return (
            <div className={`slot ${card?.isRest ? "rest" : "active"}`} key={index}>
              <div>{card ? card.card.name : "-"}</div>
              {card && (
                <div className="card-status">
                  {card.isRest ? "REST" : "ACTIVE"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default App;
