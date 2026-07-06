import { CardInstance } from "../../../gameEngine/cards/CardInstance";
import { CardView } from "./CardView";

export type CardChoiceSource =
  | "searchTopDeck"
  | "discardHand"
  | "playFromHand"
  | "trash"
  | "deck"
  | "hand";

export type PendingCardChoice = {
  source: CardChoiceSource;
  title: string;
  cards: CardInstance[];
  minCount: number;
  maxCount: number;
  selectedCards: CardInstance[];
  selectableCards?: CardInstance[];
  context?: {
    sourceCard: CardInstance;
    handIndex?: number;
    playerId?: string
  };
  
};

type Props = {
  choice: PendingCardChoice | null;
  onToggleCard: (card: CardInstance) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onHoverImage?: (imagePath: string | null) => void;
  canCancel?: boolean;
};

export function CardChoicePanel({
  choice,
  onToggleCard,
  onConfirm,
  onCancel,
  onHoverImage,
  canCancel = true,
}: Props) {
  if (!choice) {
    return null;
  }

  const canConfirm =
    choice.selectedCards.length >= choice.minCount &&
    choice.selectedCards.length <= choice.maxCount;

  return (
    <section className="card-choice-panel">
      <div className="card-choice-header">
        <h2>{choice.title}</h2>
        <div>
          {choice.selectedCards.length}/{choice.maxCount}
        </div>
      </div>

      <div className="card-choice-list">
        {choice.cards.map((card) => {
          const selectableCards = choice.selectableCards ?? choice.cards;
          const selectable = selectableCards.includes(card);
          const selected = choice.selectedCards.includes(card);

          return (
            <button
              key={card.instanceId}
              className={[
                "card-choice-item",
                selected ? "selected" : "",
                !selectable ? "not-selectable" : "",
              ].join(" ")}
              disabled={!selectable}
              onClick={() => {
                if (!selectable) return;
                onToggleCard(card);
              }}
              onMouseEnter={() => onHoverImage?.(card.card.imagePath ?? null)}
              onMouseLeave={() => onHoverImage?.(null)}
            >
              <CardView card={card} onHoverImage={onHoverImage} />
              <div className="card-choice-name">{card.card.name}</div>
            </button>
          );
        })}
      </div>

      <div className="card-choice-actions">
        <button onClick={onConfirm} disabled={!canConfirm}>
          決定
        </button>
        {canCancel && (
          <button onClick={onCancel}>キャンセル</button>
        )}
      </div>
    </section>
  );
}