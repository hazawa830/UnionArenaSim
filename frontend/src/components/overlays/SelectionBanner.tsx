type Props = {
  raidBaseSelecting: boolean;
  targetSelecting: boolean;
  selectedCount: number;
  requiredCount: number;
  onCancelRaid: () => void;
  onCancelSelection: () => void;
};

export function SelectionBanner({
  raidBaseSelecting,
  targetSelecting,
  selectedCount,
  requiredCount,
  onCancelRaid,
  onCancelSelection,
}: Props) {
  return (
    <>
      {raidBaseSelecting && (
        <div className="selection-banner">
          レイド元を選択してください
          <button onClick={onCancelRaid}>Cancel</button>
        </div>
      )}

      {targetSelecting && (
        <div className="selection-banner">
          対象を選択してください：
          {selectedCount}/{requiredCount}
          <button onClick={onCancelSelection}>Cancel</button>
        </div>
      )}
    </>
  );
}