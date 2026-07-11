type Props = {
  isOpen: boolean;
  onStartChoice: () => void;
  onDecline: () => void;
};

export function TriggerChoiceBanner({
  isOpen,
  onStartChoice,
  onDecline,
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="trigger-choice-banner">
      <div>トリガー効果を使用しますか？</div>

      <button onClick={onStartChoice}>使用する</button>
      <button onClick={onDecline}>使わずトラッシュに置く</button>
    </div>
  );
}