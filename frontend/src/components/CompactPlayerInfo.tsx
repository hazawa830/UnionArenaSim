import { Game } from "../../../gameEngine/core/Game";

type Player = ReturnType<Game["getCurrentPlayer"]>;

export function CompactPlayerInfo({
  title,
  player,
  onOpenTrash,
}: {
  title: string;
  player: Player;
  onOpenTrash?: () => void;
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

      <button
        type="button"
        className="trash-zone trash-zone-button"
        onClick={onOpenTrash}
        disabled={!onOpenTrash}
      >
        <div className="trash-zone-title">
          TRASH ({player.board.trash.length})
        </div>

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
      </button>
    </section>
  );
}