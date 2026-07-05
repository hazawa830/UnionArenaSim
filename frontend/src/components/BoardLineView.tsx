import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { Player } from "../../../gameEngine/core/Player";
import { CardInstance } from "../../../gameEngine/cards/CardInstance";

type Props = {
  player: Player;
  line: BoardLine;
  title: string;
  isYou?: boolean;
  reverse?: boolean;
  isRaidBaseSelecting?: boolean;
  onSelectRaidBase?: (line: BoardLine, index: number) => void;
  onMoveToFront?: (energyIndex: number) => void;
  onAttack?: (frontIndex: number) => void;
  onHoverImage?: (imagePath: string | null) => void;
};

export function BoardLineView({
  player,
  line,
  title,
  isYou = false,
  reverse = false,
  isRaidBaseSelecting = false,
  onSelectRaidBase,
  onMoveToFront,
  onAttack,
  onHoverImage,
}: Props) {
  const slots =
    line === BoardLine.FrontLine
      ? player.board.frontLine
      : player.board.energyLine;

  const orderedSlots = reverse ? [...slots].reverse() : slots;

  return (
    <section className="board-line-section">
      <div className="board-line-title">{title}</div>

      <div className="board-line-slots">
        {orderedSlots.map((slot, displayIndex) => {
          const realIndex = reverse
            ? slots.length - 1 - displayIndex
            : displayIndex;

          const card = slot.getCard();

          return (
            <CardSlotView
              key={realIndex}
              card={card}
              isYou={isYou}
              line={line}
              index={realIndex}
              isRaidBaseSelecting={isRaidBaseSelecting}
              onSelectRaidBase={onSelectRaidBase}
              onMoveToFront={onMoveToFront}
              onAttack={onAttack}
              onHoverImage={onHoverImage}
            />
          );
        })}
      </div>
    </section>
  );
}

type CardSlotProps = {
  card?: CardInstance;
  isYou: boolean;
  line: BoardLine;
  index: number;
  isRaidBaseSelecting: boolean;
  onSelectRaidBase?: (line: BoardLine, index: number) => void;
  onMoveToFront?: (energyIndex: number) => void;
  onAttack?: (frontIndex: number) => void;
  onHoverImage?: (imagePath: string | null) => void;
};

function CardSlotView({
  card,
  isYou,
  line,
  index,
  isRaidBaseSelecting,
  onSelectRaidBase,
  onMoveToFront,
  onAttack,
  onHoverImage,
}: CardSlotProps) {
  const canMoveToFront = isYou && line === BoardLine.EnergyLine && card;
  const canAttack = isYou && line === BoardLine.FrontLine && card;
  const canSelectRaidBase = isYou && isRaidBaseSelecting && card;

  const handleClick = () => {
    if (canSelectRaidBase) {
      onSelectRaidBase?.(line, index);
    }
  };

  return (
    <div
      className={[
        "official-card-slot",
        card ? "has-card" : "empty-slot",
        canSelectRaidBase ? "raid-base-selectable" : "",
      ].join(" ")}
      onClick={handleClick}
      onMouseEnter={() => onHoverImage?.(card?.card.imagePath ?? null)}
      onMouseLeave={() => onHoverImage?.(null)}
    >
      {card ? (
        <>
          <img
            src={card.card.imagePath}
            className={`official-card-image ${card.isRest ? "rest-card" : ""}`}
            alt={card.card.name}
          />

          <div className="slot-card-name">{card.card.name}</div>

          {isYou && (
            <div className="slot-actions">
              {canMoveToFront && !isRaidBaseSelecting && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToFront?.(index);
                  }}
                >
                  Move
                </button>
              )}

              {canAttack && !isRaidBaseSelecting && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAttack?.(index);
                  }}
                >
                  Attack
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <span className="empty-slot-label">-</span>
      )}
    </div>
  );
}