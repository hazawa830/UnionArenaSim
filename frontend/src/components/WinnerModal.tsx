import { PlayerId } from "../../../gameEngine/enum/PlayerId";

export function WinnerModal({
  winner,
  onNewGame,
}: {
  winner: PlayerId | undefined;
  onNewGame: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>
          {winner === PlayerId.Player1
            ? "🎉 あなたの勝利！"
            : "🤖 CPUの勝利！"}
        </h2>

        <button onClick={onNewGame}>もう一度プレイ</button>
      </div>
    </div>
  );
}