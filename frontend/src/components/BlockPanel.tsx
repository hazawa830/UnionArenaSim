import { Game } from "../../../gameEngine/core/Game";

type Player = ReturnType<Game["getCurrentPlayer"]>;

export function BlockPanel({
  attackerIndex,
  player,
  isGameOver,
  onNoBlock,
  onBlock,
}: {
  attackerIndex: number;
  player: Player;
  isGameOver: boolean;
  onNoBlock: () => void;
  onBlock: (blockerIndex: number) => void;
}) {
  return (
    <section className="block-panel">
      <h2>CPUが攻撃しています</h2>
      <p>攻撃元: CPUフロントライン {attackerIndex + 1}</p>

      <button onClick={onNoBlock} disabled={isGameOver}>
        No Block
      </button>

      <h3>Blocker</h3>

      {player.board.frontLine.map((slot, index) => {
        const card = slot.getCard();

        if (!card || card.isRest) {
          return null;
        }

        return (
          <button key={index} onClick={() => onBlock(index)} disabled={isGameOver}>
            {card.card.name} でBlock
          </button>
        );
      })}
    </section>
  );
}