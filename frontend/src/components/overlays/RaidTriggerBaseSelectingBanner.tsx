type Props = {
  isOpen: boolean;
};

export function RaidTriggerBaseSelectingBanner({ isOpen }: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="selection-banner">
      レイド元を選択してください
    </div>
  );
}