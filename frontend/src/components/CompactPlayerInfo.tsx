import { Game } from "../../../gameEngine/core/Game";

type Player = ReturnType<Game["getCurrentPlayer"]>;

export function CompactPlayerInfo({
  title,
  player,
}: {
  title: string;
  player: Player;
}) {
  const lastTrash = player.board.trash[player.board.trash.length - 1];

  return (
    <section className="compact-player-info">
      <h2>{title}</h2>

      <div className="info-row">
        <span>Hand</span>
        <strong>{player.board.hand.length}</strong>
      </div>

      <div className="info-row">
        <span>Deck</span>
        <strong>{player.board.deck.length}</strong>
      </div>

      <div className="info-row">
        <span>Life</span>
        <strong>{player.board.lifeArea.length}</strong>
      </div>

      <div className="info-row">
        <span>AP</span>
        <strong>
          {player.board.activeActionPoint}/{player.board.maxActionPoint}
        </strong>
      </div>

      <div className="trash-zone">
        <div className="trash-zone-title">TRASH</div>

        <div className="trash-card-frame">
          {lastTrash ? (
            <img
              src={lastTrash.card.imagePath}
              alt={lastTrash.card.name}
              className="trash-preview-image"
            />
          ) : (
            <span className="trash-empty">EMPTY</span>
          )}
        </div>

        <div className="trash-count">{player.board.trash.length}枚</div>
      </div>
    </section>
  );
}