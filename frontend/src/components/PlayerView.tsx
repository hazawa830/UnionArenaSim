import { Player } from "../../../gameEngine/core/Player";
import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { BoardLineView } from "./BoardLineView";

type Props = {
  title: string;
  player: Player;
  isYou?: boolean;
  reverseLines?: boolean;
  isRaidBaseSelecting?: boolean;
  onSelectRaidBase?: (line: BoardLine, index: number) => void;
  onMoveToFront?: (energyIndex: number) => void;
  onAttack?: (frontIndex: number) => void;
  onHoverImage?: (imagePath: string | null) => void;
};

export function PlayerView({
  title,
  player,
  isYou = false,
  reverseLines = false,
  isRaidBaseSelecting = false,
  onSelectRaidBase,
  onMoveToFront,
  onAttack,
  onHoverImage,
}: Props) {
  return (
    <section className="player-view official-player-view">
      <div className="player-header">
        <strong>
          {title}: {player.name}
        </strong>
      </div>

      <div className="player-stats-row">
        <span>Hand: {player.board.hand.length}</span>
        <span>Deck: {player.board.deck.length}</span>
        <span>Life: {player.board.lifeArea.length}</span>
        <span>
          AP: {player.board.activeActionPoint}/{player.board.maxActionPoint}
        </span>
      </div>

      {reverseLines ? (
        <>
          <BoardLineView
            player={player}
            line={BoardLine.FrontLine}
            title="Front Line"
            reverse
            onHoverImage={onHoverImage}
          />
          <BoardLineView
            player={player}
            line={BoardLine.EnergyLine}
            title="Energy Line"
            reverse
            onHoverImage={onHoverImage}
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
            onSelectRaidBase={onSelectRaidBase}
            onAttack={onAttack}
            onHoverImage={onHoverImage}
          />
          <BoardLineView
            player={player}
            line={BoardLine.EnergyLine}
            title="Energy Line"
            isYou={isYou}
            isRaidBaseSelecting={isRaidBaseSelecting}
            onSelectRaidBase={onSelectRaidBase}
            onMoveToFront={onMoveToFront}
            onHoverImage={onHoverImage}
          />
        </>
      )}
    </section>
  );
}