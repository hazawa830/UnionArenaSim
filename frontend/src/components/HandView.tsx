import { Game } from "../../../gameEngine/core/Game";
import { CardType } from "../../../gameEngine/enum/CardType";
import { CardView } from "./CardView";

type Player = ReturnType<Game["getCurrentPlayer"]>;

type Props = {
  player: Player;
  isYourTurn: boolean;
  isGameOver: boolean;
  onPlayToEnergy: (handIndex: number) => void;
  onPlayToFront: (handIndex: number) => void;
  onUseEvent: (handIndex: number) => void;
  onStartRaid?: (handIndex: number) => void;
  onHoverImage?: (imagePath: string | null) => void;
};

export function HandView({
  player,
  isYourTurn,
  isGameOver,
  onPlayToEnergy,
  onPlayToFront,
  onUseEvent,
  onStartRaid,
  onHoverImage,
}: Props) {
  return (
    <section className="hand-view">
      {!isYourTurn && (
        <p className="hand-disabled-message">
          相手ターン中です。自分のカードは操作できません。
        </p>
      )}

      <div className="hand">
        {player.board.hand.map((card, index) => {
          const isEvent = card.card.cardType === CardType.Event;
          const canRaid = card.card.raidConditions.length > 0;

          return (
            <div
              className="hand-card"
              key={card.instanceId}
              onMouseEnter={() => onHoverImage?.(card.card.imagePath ?? null)}
              onMouseLeave={() => onHoverImage?.(null)}
            >
              <CardView card={card} onHoverImage={onHoverImage} />

              <div className="hand-card-actions">
                {isEvent ? (
                  <button
                    onClick={() => onUseEvent(index)}
                    disabled={isGameOver || !isYourTurn}
                  >
                    Event
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onPlayToEnergy(index)}
                      disabled={isGameOver || !isYourTurn}
                    >
                      Energy
                    </button>

                    <button
                      onClick={() => onPlayToFront(index)}
                      disabled={isGameOver || !isYourTurn}
                    >
                      Front
                    </button>

                    {canRaid && (
                      <button
                        onClick={() => onStartRaid?.(index)}
                        disabled={isGameOver || !isYourTurn}
                      >
                        Raid
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}