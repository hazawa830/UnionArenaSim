import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { Player } from "../../../gameEngine/core/Player";
import { CardInstance } from "../../../gameEngine/cards/CardInstance";
import { Game } from "../../../gameEngine/core/Game";
type TargetSide = "own" | "opponent";
import { ContinuousEffectResolver } from "../../../gameEngine/effects/ContinuousEffectResolver";

type Props = {
  player: Player;
  line: BoardLine;
  title: string;
  isYou?: boolean;
  reverse?: boolean;

  isRaidBaseSelecting?: boolean;
  isTargetSelecting?: boolean;
  targetSide?: TargetSide;

  onSelectRaidBase?: (line: BoardLine, index: number) => void;
  onSelectTarget?: (
    side: TargetSide,
    line: BoardLine,
    index: number
  ) => void;

  onMoveToFront?: (energyIndex: number) => void;
  onAttack?: (frontIndex: number) => void;
  onStartActivateMain?: (line: BoardLine, index: number) => void;
  onHoverImage?: (imagePath: string | null) => void;
  game: Game;
  actor: Player;
  opponent: Player;
};

export function BoardLineView({
    player,
    line,
    title,
    isYou = false,
    reverse = false,

    isRaidBaseSelecting = false,
    isTargetSelecting = false,
    targetSide,

    onSelectRaidBase,
    onSelectTarget,
    onMoveToFront,
    onAttack,
    onStartActivateMain,
    onHoverImage,
    game,
  actor,
  opponent
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
              isTargetSelecting={isTargetSelecting}
              targetSide={targetSide}
              onSelectRaidBase={onSelectRaidBase}
              onSelectTarget={onSelectTarget}
              onMoveToFront={onMoveToFront}
              onAttack={onAttack}
              onStartActivateMain={onStartActivateMain}
              onHoverImage={onHoverImage}
              game={game}
              actor={actor}
              opponent={opponent}
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
  isTargetSelecting: boolean;
  targetSide?: TargetSide;

  onSelectRaidBase?: (line: BoardLine, index: number) => void;
  onSelectTarget?: (
    side: TargetSide,
    line: BoardLine,
    index: number
  ) => void;

  onMoveToFront?: (energyIndex: number) => void;
  onAttack?: (frontIndex: number) => void;
  onStartActivateMain?: (line: BoardLine, index: number) => void;
  onHoverImage?: (imagePath: string | null) => void;
  game: Game;
  actor: Player;
  opponent: Player;
  };

function CardSlotView({
  card,
  isYou,
  line,
  index,

  isRaidBaseSelecting,
  isTargetSelecting,
  targetSide,

  onSelectRaidBase,
  onSelectTarget,
  onMoveToFront,
  onAttack,
  onStartActivateMain,
  onHoverImage,
  game,
  actor,
  opponent,
}: CardSlotProps) {
  const canMoveToFront = Boolean(
    isYou && line === BoardLine.EnergyLine && card
  );

  const canAttack = Boolean(
    isYou && line === BoardLine.FrontLine && card
  );

  const canActivateMain = Boolean(
    isYou &&
      card &&
      card.card.effects.some((effect) => effect.trigger === "activateMain")
  );

  const canSelectRaidBase = Boolean(isYou && isRaidBaseSelecting && card);
  const canSelectTarget = Boolean(isTargetSelecting && targetSide && card);
  const continuousBpBonus =
    card
      ? ContinuousEffectResolver.getBpBonus({
          game,
          source: card,
          actor,
          opponent,
        })
      : 0;

  const temporaryBpBonus = card?.temporaryBpBonus ?? 0;
  const isSelecting = isRaidBaseSelecting || isTargetSelecting;

  const handleClick = () => {
    if (canSelectTarget && targetSide) {
      onSelectTarget?.(targetSide, line, index);
      return;
    }

    if (canSelectRaidBase) {
      onSelectRaidBase?.(line, index);
      return;
    }
  };

  return (
    <div
      className={[
        "official-card-slot",
        card ? "has-card" : "empty-slot",
        canSelectRaidBase ? "raid-base-selectable" : "",
        canSelectTarget ? "target-selectable" : "",
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
          {(temporaryBpBonus !== 0 || continuousBpBonus !== 0 )&& (
          <div className="bp-bonus-badge temporary-bp-badge">
            {temporaryBpBonus > 0 ? "+" : ""}
            {temporaryBpBonus + continuousBpBonus}
          </div>
        )}

          <div className="slot-card-name">{card.card.name}</div>

          {isYou && (
            <div className="slot-actions">
              {canMoveToFront && !isSelecting && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToFront?.(index);
                  }}
                >
                  Move
                </button>
              )}

              {canActivateMain && !isSelecting && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartActivateMain?.(line, index);
                  }}
                >
                  Activate
                </button>
              )}

              {canAttack && !isSelecting && (
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