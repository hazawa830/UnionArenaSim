import { Player } from "../../../gameEngine/core/Player";
import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { BoardLineView } from "./BoardLineView";
import { Game } from "../../../gameEngine/core/Game";

type TargetSide = "own" | "opponent";

type Props = {
  title: string;
  player: Player;
  isYou?: boolean;
  reverseLines?: boolean;

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
  onHoverImage?: (imagePath: string | null) => void;
  onStartActivateMain?: (line: BoardLine, index: number) => void;
  game: Game;
  opponent: Player;
};

export function PlayerView({
  player,
  isYou = false,
  reverseLines = false,

  isRaidBaseSelecting = false,
  isTargetSelecting = false,
  targetSide,

  onSelectRaidBase,
  onSelectTarget,
  onMoveToFront,
  onAttack,
  onHoverImage,
  onStartActivateMain,
  game,
  opponent,
}: Props) {
  return (
    <section className="player-view official-player-view">
      {reverseLines ? (
        <>
          <BoardLineView
            player={player}
            line={BoardLine.FrontLine}
            title="Front Line"
            reverse
            isTargetSelecting={isTargetSelecting}
            targetSide={targetSide}
            onSelectTarget={onSelectTarget}
            onHoverImage={onHoverImage}
            onStartActivateMain={onStartActivateMain}
            game={game}
            actor={player}
            opponent={opponent}
          />

          <BoardLineView
            player={player}
            line={BoardLine.EnergyLine}
            title="Energy Line"
            reverse
            isTargetSelecting={isTargetSelecting}
            targetSide={targetSide}
            onSelectTarget={onSelectTarget}
            onHoverImage={onHoverImage}
            onStartActivateMain={onStartActivateMain}
            game={game}
            actor={player}
            opponent={opponent}
          />
        </>
      ) : (
        <>
          <BoardLineView
            player={player}
            line={BoardLine.FrontLine}
            title="Front Line"
            isYou={isYou}
            isRaidBaseSelecting={isRaidBaseSelecting}
            isTargetSelecting={isTargetSelecting}
            targetSide={targetSide}
            onSelectRaidBase={onSelectRaidBase}
            onSelectTarget={onSelectTarget}
            onAttack={onAttack}
            onHoverImage={onHoverImage}
            onStartActivateMain={onStartActivateMain}
            game={game}
            actor={player}
            opponent={opponent}
          />

          <BoardLineView
            player={player}
            line={BoardLine.EnergyLine}
            title="Energy Line"
            isYou={isYou}
            isRaidBaseSelecting={isRaidBaseSelecting}
            isTargetSelecting={isTargetSelecting}
            targetSide={targetSide}
            onSelectRaidBase={onSelectRaidBase}
            onSelectTarget={onSelectTarget}
            onMoveToFront={onMoveToFront}
            onHoverImage={onHoverImage}
            onStartActivateMain={onStartActivateMain}
            game={game}
            actor={player}
            opponent={opponent}
          />
        </>
      )}
    </section>
  );
}