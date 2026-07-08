type Props = {
  isOpen: boolean;
  onStartRaid: () => void;
  onDeclineRaid: () => void;
};

export function RaidTriggerBanner({
  isOpen,
  onStartRaid,
  onDeclineRaid,
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="selection-banner">
      レイドトリガーが公開されました
      <button onClick={onStartRaid}>レイドする</button>
      <button onClick={onDeclineRaid}>手札に加える</button>
    </div>
  );
}