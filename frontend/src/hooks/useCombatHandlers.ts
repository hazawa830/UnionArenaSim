import { AttackAction } from "../../../gameEngine/actions/AttackAction";
import type { Game } from "../../../gameEngine/core/Game";

type Props = {
  game: Game;
  isYourTurn: boolean;
  pendingAttack: number | null;
  setPendingAttack: React.Dispatch<React.SetStateAction<number | null>>;
  refresh: () => void;
};

export function useCombatHandlers({
  game,
  isYourTurn,
  pendingAttack,
  setPendingAttack,
  refresh,
}: Props) {
  /**
   * 攻撃開始。
   *
   * ここではまだAttackActionを実行せず、
   * 防御側のブロック選択を待つ。
   */
  const handleAttack = (frontIndex: number) => {
    if (!isYourTurn) {
      alert("相手ターンです");
      return;
    }

    if (pendingAttack !== null) {
      return;
    }

    const attackerSlot = game.getCurrentPlayer().board.frontLine[frontIndex];
    const attacker = attackerSlot?.getCard();

    if (!attacker) {
      alert("攻撃するカードがありません");
      return;
    }

    if (attacker.isRest) {
      alert("レスト状態のカードは攻撃できません");
      return;
    }

    setPendingAttack(frontIndex);
    refresh();
  };

  /**
   * ブロック選択後に攻撃を実際に解決する。
   */
  const resolvePendingAttack = (blockerIndex?: number) => {
    if (pendingAttack === null) {
      return;
    }

    try {
      AttackAction.execute(game, pendingAttack, blockerIndex);
      setPendingAttack(null);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleNoBlock = () => {
    resolvePendingAttack();
  };

  const handleBlock = (blockerIndex: number) => {
    resolvePendingAttack(blockerIndex);
  };

  return {
    handleAttack,
    handleNoBlock,
    handleBlock,
  };
}