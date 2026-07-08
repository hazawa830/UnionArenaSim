import { BoardLine } from "../../../../gameEngine/enum/BoardLine";

type Props = {
  isOpen: boolean;
  allowedLines: BoardLine[];
  canPlayToFront: boolean;
  canPlayToEnergy: boolean;
  onSelectDestination: (destinationLine: BoardLine) => void;
};

export function PlayDestinationModal({
  isOpen,
  allowedLines,
  canPlayToFront,
  canPlayToEnergy,
  onSelectDestination,
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>登場先を選択</h3>

        <div className="raid-destination-buttons">
          {allowedLines.includes(BoardLine.FrontLine) && (
            <button
              disabled={!canPlayToFront}
              onClick={() => onSelectDestination(BoardLine.FrontLine)}
            >
              Front Lineに登場
            </button>
          )}

          {allowedLines.includes(BoardLine.EnergyLine) && (
            <button
              disabled={!canPlayToEnergy}
              onClick={() => onSelectDestination(BoardLine.EnergyLine)}
            >
              Energy Lineに登場
            </button>
          )}
        </div>
      </div>
    </div>
  );
}