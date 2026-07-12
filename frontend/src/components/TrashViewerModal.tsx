import type { Player } from "../../../gameEngine/core/Player";

type Props = {
  player: Player | null;
  title: string;
  onClose: () => void;
  onHoverImage?: (imagePath: string | null) => void;
};

export function TrashViewerModal({
  player,
  title,
  onClose,
  onHoverImage,
}: Props) {
  if (!player) {
    return null;
  }

  const trashCards = [...player.board.trash].reverse();

  return (
    <div className="modal-backdrop">
      <div className="trash-viewer-modal">
        <div className="trash-viewer-header">
          <h2>{title} Trash</h2>

          <button className="trash-viewer-close-button" onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className="trash-viewer-count">
          Trash: {trashCards.length}
        </div>

        {trashCards.length === 0 ? (
          <div className="trash-viewer-empty">
            トラッシュにカードはありません
          </div>
        ) : (
          <div className="trash-viewer-grid">
            {trashCards.map((card) => (
              <div
                key={card.instanceId}
                className="trash-viewer-card"
                onMouseEnter={() => onHoverImage?.(card.card.imagePath ?? null)}
                onMouseLeave={() => onHoverImage?.(null)}
              >
                <img
                  src={card.card.imagePath}
                  className="trash-viewer-card-image"
                  alt={card.card.name}
                />
                <div className="trash-viewer-card-name">
                  {card.card.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}