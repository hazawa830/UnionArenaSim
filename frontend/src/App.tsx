import { useEffect, useReducer, useRef, useState } from "react";
import "./App.css";

import { GameFactory } from "../../gameEngine/factory/GameFactory";
import { RandomCPU } from "../../gameEngine/cpu/RandomCPU";
import { Game } from "../../gameEngine/core/Game";
import { BoardLine } from "../../gameEngine/enum/BoardLine";
import { PlayCardAction } from "../../gameEngine/actions/PlayCardAction";
import { MoveCardAction } from "../../gameEngine/actions/MoveAction";
import { AttackAction } from "../../gameEngine/actions/AttackAction";
import { GamePhase } from "../../gameEngine/enum/GamePhase";
import { ExtraDrawAction } from "../../gameEngine/actions/ExtraDrawAction";
import { PlayerId } from "../../gameEngine/enum/PlayerId";

function App() {
  const gameRef = useRef<Game>(GameFactory.createSampleGame());
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [pendingAttack, setPendingAttack] = useState<number | null>(null);
  const game = gameRef.current;
  const player1 = game.player1;
  const player2 = game.player2;
  const currentPlayer = game.getCurrentPlayer();
  const isYourTurn = currentPlayer === player1;
  const isGameOver = game.winner !== undefined;

  const refresh = () => forceUpdate();
  useEffect(() => {
  if (!game.winner) {
    return;
  }

  const winnerName =
    game.winner === player1.id ? "あなた" : "CPU";

  alert(`${winnerName}の勝利です！`);
}, [game.winner]);

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

  const handleNextPhase = () => {
    game.nextPhase();
    refresh();
  };
  const handleExtraDraw = () => {
    if (!isYourTurn) {
      alert("相手ターンです");
      return;
    }

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

      if (blockerIndex === undefined) {
        alert("CPUはブロックしませんでした");
      } else {
        alert(`CPUはフロントライン${blockerIndex + 1}番でブロックしました`);
      }

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
      {isGameOver && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>
              {game.winner === PlayerId.Player1
                ? "🎉 あなたの勝利！"
                : "🤖 CPUの勝利！"}
            </h2>

            <button
              onClick={() => {
                gameRef.current = GameFactory.createSampleGame();
                setPendingAttack(null);
                refresh();
              }}
            >
              もう一度プレイ
            </button>
          </div>
        </div>
      )}
      <button onClick={handleNextPhase} disabled={isGameOver}>Next Phase</button>

      {isYourTurn && game.phase === GamePhase.Start && (
        <button onClick={handleExtraDraw} disabled={isGameOver}>Extra Draw - AP1</button>
      )}

      <PlayerView title="Opponent" player={player2} reverseLines />

      <hr />
      {pendingAttack !== null && (
        <section className="block-panel">
          <h2>CPUが攻撃しています</h2>
          <p>攻撃元: CPUフロントライン {pendingAttack + 1}</p>

          <button onClick={handleNoBlock} disabled={isGameOver}>No Block</button>

          <h3>Blocker</h3>
          {player1.board.frontLine.map((slot, index) => {
            const card = slot.getCard();

            if (!card || card.isRest) {
              return null;
            }

            return (
              <button key={index} onClick={() => handleBlock(index)}>
                {card.card.name} でBlock
              </button>
            );
          })}
        </section>
      )}
      <PlayerView
        title="You"
        player={player1}
        isYou
        onMoveToFront={handleMoveToFront}
        onAttack={handleAttack}
      />

      <section>
        <h2>Your Hand</h2>
        {!isYourTurn && <p>相手ターン中です。自分のカードは操作できません。</p>}

        <div className="hand">
          {player1.board.hand.map((card, index) => (
            <div className="card" key={card.instanceId}>
              <div>{card.card.name}</div>
              <div>{card.isRest ? "REST" : "ACTIVE"}</div>
              <button onClick={() => handlePlayToEnergy(index)} disabled={isGameOver}>Energy</button>
              <button onClick={() => handlePlayToFront(index)} disabled={isGameOver}>Front</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PlayerView({
  title,
  player,
  isYou = false,
  reverseLines = false,
  onMoveToFront,
  onAttack,
}: {
  title: string;
  player: ReturnType<Game["getCurrentPlayer"]>;
  isYou?: boolean;
  reverseLines?: boolean;
  onMoveToFront?: (energyIndex: number) => void;
  onAttack?: (frontIndex: number) => void;
}) {
  const frontLineView = (
    <>
      <h3>Front Line</h3>
      <div className="line">
        {player.board.frontLine.map((slot, index) => {
          const card = slot.getCard();

          return (
            <div
              className={`slot ${card?.isRest ? "rest" : "active"}`}
              key={index}
            >
              <div>{card ? card.card.name : "-"}</div>

              {card && (
                <>
                  <div className="card-status">
                    {card.isRest ? "REST" : "ACTIVE"}
                  </div>

                  {isYou && (
                    <button onClick={() => onAttack?.(index)}>Attack</button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  const energyLineView = (
    <>
      <h3>Energy Line</h3>
      <div className="line">
        {player.board.energyLine.map((slot, index) => {
          const card = slot.getCard();

          return (
            <div
              className={`slot ${card?.isRest ? "rest" : "active"}`}
              key={index}
            >
              <div>{card ? card.card.name : "-"}</div>

              {card && (
                <>
                  <div className="card-status">
                    {card.isRest ? "REST" : "ACTIVE"}
                  </div>

                  {isYou && (
                    <button onClick={() => onMoveToFront?.(index)}>
                      Move to Front
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

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

      {reverseLines ? (
        <>
          {energyLineView}
          {frontLineView}
        </>
      ) : (
        <>
          {frontLineView}
          {energyLineView}
        </>
      )}
    </section>
  );
}

export default App;
