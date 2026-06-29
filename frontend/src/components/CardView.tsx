import { CardInstance } from "../../../gameEngine/cards/CardInstance";

export function CardView({ card }: { card?: CardInstance }) {
  if (!card) {
    return <div>-</div>;
  }

  return (
    <>
      {card.card.imagePath ? (
        <img src={card.card.imagePath} alt={card.card.name} className="card-image" />
      ) : (
        <div>{card.card.name}</div>
      )}

      <div className="card-status">{card.isRest ? "REST" : "ACTIVE"}</div>
    </>
  );
}