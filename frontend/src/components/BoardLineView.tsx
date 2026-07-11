import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { Player } from "../../../gameEngine/core/Player";
import { Game } from "../../../gameEngine/core/Game";

import {
  CardSlotView,
  type TargetSide,
} from "./CardSlotView";

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

