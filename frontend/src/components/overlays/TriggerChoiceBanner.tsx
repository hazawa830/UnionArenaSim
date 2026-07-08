type Props = {
  isOpen: boolean;
  onStartChoice: () => void;
};

export function TriggerChoiceBanner({ isOpen, onStartChoice }: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="selection-banner">
      トリガー効果の対象を選択してください
      <button onClick={onStartChoice}>対象を選ぶ</button>
    </div>
  );
}