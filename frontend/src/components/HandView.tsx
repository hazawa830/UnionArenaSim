import { Game } from "../../../gameEngine/core/Game";
import { CardView } from "./CardView";

type Player = ReturnType<Game["getCurrentPlayer"]>;

export function HandView({
  player,
  isYourTurn,
  isGameOver,
  onPlayToEnergy,
  onPlayToFront,
  onHoverImage,
}: {
  player: Player;
  isYourTurn: boolean;
  isGameOver: boolean;
  onPlayToEnergy: (handIndex: number) => void;
  onPlayToFront: (handIndex: number) => void;
  onHoverImage?: (imagePath: string) => void;
}) {
  return (
    <section>
      <h2>Your Hand</h2>

      {!isYourTurn && <p>相手ターン中です。自分のカードは操作できません。</p>}

      <div className="hand">
        {player.board.hand.map((card, index) => (
          <div className="card" key={card.instanceId}>
            <CardView card={card} onHoverImage={onHoverImage}/>

            <button onClick={() => onPlayToEnergy(index)} disabled={isGameOver}>
              Energy
            </button>

            <button onClick={() => onPlayToFront(index)} disabled={isGameOver}>
              Front
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}