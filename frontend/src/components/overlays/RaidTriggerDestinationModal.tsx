import { BoardLine } from "../../../../gameEngine/enum/BoardLine";

type PendingRaidTriggerBase = {
  baseLine: BoardLine;
  baseIndex: number;
};

type Props = {
  pendingRaidTriggerBase: PendingRaidTriggerBase | null;
  frontSlotEmpty: boolean[];
  onSelectDestination: (
    destinationLine: BoardLine,
    destinationIndex?: number
  ) => void;
};

export function RaidTriggerDestinationModal({
  pendingRaidTriggerBase,
  frontSlotEmpty,
  onSelectDestination,
}: Props) {
  if (!pendingRaidTriggerBase) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>レイドトリガー登場先を選択</h3>

        <div className="raid-destination-buttons">
          <button
            onClick={() =>
              onSelectDestination(
                BoardLine.EnergyLine,
                pendingRaidTriggerBase.baseIndex
              )
            }
          >
            Energy Lineに登場
          </button>

          {frontSlotEmpty.map((isEmpty, index) => (
            <button
              key={index}
              disabled={!isEmpty}
              onClick={() => onSelectDestination(BoardLine.FrontLine, index)}
            >
              Front {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}