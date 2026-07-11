import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import type { Player } from "../../../gameEngine/core/Player";
import type { CardInstance } from "../../../gameEngine/cards/CardInstance";
import type { Game } from "../../../gameEngine/core/Game";
import { ContinuousEffectResolver } from "../../../gameEngine/effects/ContinuousEffectResolver";
import { CardActionButtons } from "./CardActionButtons";
export type TargetSide = "own" | "opponent";

export type CardSlotProps = {
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
  onMoveToEnergy?: (frontIndex: number) => void;
  game: Game;
  actor: Player;
  opponent: Player;
  };

export function CardSlotView({
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
  onMoveToEnergy,
  game,
  actor,
  opponent,
}: CardSlotProps) {
  const canMoveToFront = Boolean(
    isYou && line === BoardLine.EnergyLine && card
  );
  const canMoveToEnergy = Boolean(
    isYou &&
      line === BoardLine.FrontLine &&
      card &&
      card.card.hasKeyword("step")
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

          <CardActionButtons
            isYou={isYou}
            line={line}
            index={index}
            canMoveToFront={canMoveToFront}
            canMoveToEnergy={canMoveToEnergy}
            canActivateMain={canActivateMain}
            canAttack={canAttack}
            isSelecting={isSelecting}
            onMoveToFront={onMoveToFront}
            onMoveToEnergy={onMoveToEnergy}
            onAttack={onAttack}
            onStartActivateMain={onStartActivateMain}
          />
        </>
      ) : (
        <span className="empty-slot-label">-</span>
      )}
    </div>
  );
}