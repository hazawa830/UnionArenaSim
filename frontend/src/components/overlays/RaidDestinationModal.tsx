import { BoardLine } from "../../../../gameEngine/enum/BoardLine";

type PendingRaidBase = {
  handIndex: number;
  baseLine: BoardLine;
  baseIndex: number;
};

type Props = {
  pendingRaidBase: PendingRaidBase | null;
  frontSlotEmpty: boolean[];
  onSelectDestination: (
    destinationLine: BoardLine,
    destinationIndex: number
  ) => void;
  onCancel: () => void;
};

export function RaidDestinationModal({
  pendingRaidBase,
  frontSlotEmpty,
  onSelectDestination,
  onCancel,
}: Props) {
  if (!pendingRaidBase) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>レイド登場先を選択</h3>

        <div className="raid-destination-buttons">
          <button
            onClick={() =>
              onSelectDestination(
                BoardLine.EnergyLine,
                pendingRaidBase.baseIndex
              )
            }
          >
            Energy Lineに登場
          </button>

          {frontSlotEmpty.map((isEmpty, index) => (
            <button
              key={index}
              disabled={!isEmpty}
              onClick={() =>
                onSelectDestination(BoardLine.FrontLine, index)
              }
            >
              Front {index + 1}
            </button>
          ))}
        </div>

        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}