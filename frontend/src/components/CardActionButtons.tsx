import { BoardLine } from "../../../gameEngine/enum/BoardLine";

type Props = {
  isYou: boolean;
  line: BoardLine;
  index: number;

  canMoveToFront: boolean;
  canActivateMain: boolean;
  canAttack: boolean;
  isSelecting: boolean;

  onMoveToFront?: (energyIndex: number) => void;
  onAttack?: (frontIndex: number) => void;
  onStartActivateMain?: (line: BoardLine, index: number) => void;
  canMoveToEnergy: boolean;
  onMoveToEnergy?: (frontIndex: number) => void;
};

export function CardActionButtons({
  isYou,
  line,
  index,
  canMoveToFront,
  canActivateMain,
  canAttack,
  isSelecting,
  onMoveToFront,
  onAttack,
  onStartActivateMain,
  canMoveToEnergy,
  onMoveToEnergy,
}: Props) {
  if (!isYou) {
    return null;
  }

  return (
    <div className="slot-actions">
      {canMoveToFront && !isSelecting && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveToFront?.(index);
          }}
        >
          Move
        </button>
      )}
      {canMoveToEnergy && !isSelecting && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveToEnergy?.(index);
          }}
        >
          Move
        </button>
      )}
      {canActivateMain && !isSelecting && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartActivateMain?.(line, index);
          }}
        >
          Activate
        </button>
      )}

      {canAttack && !isSelecting && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAttack?.(index);
          }}
        >
          Attack
        </button>
      )}
    </div>
  );
}