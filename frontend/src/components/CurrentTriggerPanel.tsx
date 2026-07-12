import type { Game } from "../../../gameEngine/core/Game";

type Props = {
  game: Game;

  onStartTriggerChoice?: () => void;
  onDeclineTriggerChoice?: () => void;

  onStartRaidTrigger?: () => void;
  onDeclineRaidTrigger?: () => void;
};

export function CurrentTriggerPanel({
  game,
  onStartTriggerChoice,
  onDeclineTriggerChoice,
  onStartRaidTrigger,
  onDeclineRaidTrigger,
}: Props) {
  const triggerCard =
    game.pendingTriggerChoice?.revealedCard ??
    game.pendingRaidTrigger?.revealedCard;

  const triggerType =
    game.pendingTriggerChoice?.triggerType ??
    (game.pendingRaidTrigger ? "raid" : undefined);

  if (!triggerCard) {
    return null;
  }

  const canChooseNormalTrigger = game.pendingTriggerChoice !== undefined;
  const canChooseRaidTrigger = game.pendingRaidTrigger !== undefined;

  return (
    <section className="current-trigger-panel">
      <div className="current-trigger-header">TRIGGER CHECK</div>

      <div className="current-trigger-type">
        {String(triggerType).toUpperCase()} TRIGGER
      </div>

      <div className="current-trigger-card-frame">
        <img
          src={triggerCard.card.imagePath}
          className="current-trigger-card-image"
          alt={triggerCard.card.name}
        />
      </div>

      <div className="current-trigger-card-name">
        {triggerCard.card.name}
      </div>

      {canChooseNormalTrigger && (
        <div className="current-trigger-actions">
          <div className="current-trigger-question">
            トリガー効果を使用しますか？
          </div>

          <button
            className="trigger-use-button"
            onClick={onStartTriggerChoice}
          >
            使用する
          </button>

          <button
            className="trigger-decline-button"
            onClick={onDeclineTriggerChoice}
          >
            使わずトラッシュに置く
          </button>
        </div>
      )}

      {canChooseRaidTrigger && (
        <div className="current-trigger-actions">
          <div className="current-trigger-question">
            レイドトリガーを使用しますか？
          </div>

          <button
            className="trigger-use-button"
            onClick={onStartRaidTrigger}
          >
            レイドする
          </button>

          <button
            className="trigger-decline-button"
            onClick={onDeclineRaidTrigger}
          >
            使わず手札に加える
          </button>
        </div>
      )}

      <div className="current-trigger-hint">
        トリガー処理中のカードです
      </div>
    </section>
  );
}