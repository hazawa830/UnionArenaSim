import { Game } from "../../../gameEngine/core/Game";
import { CardView } from "./CardView";

type Player = ReturnType<Game["getCurrentPlayer"]>;

export function PlayerView({
  title,
  player,
  isYou = false,
  reverseLines = false,
  onMoveToFront,
  onAttack,
}: {
  title: string;
  player: Player;
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
            <div className={`slot ${card?.isRest ? "rest" : "active"}`} key={index}>
              <CardView card={card} />

              {card && isYou && (
                <button onClick={() => onAttack?.(index)}>Attack</button>
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
            <div className={`slot ${card?.isRest ? "rest" : "active"}`} key={index}>
              <CardView card={card} />

              {card && isYou && (
                <button onClick={() => onMoveToFront?.(index)}>
                  Move to Front
                </button>
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