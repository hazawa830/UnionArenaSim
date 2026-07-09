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
  const handleAttack = (frontIndex: number) => {
    if (!isYourTurn) return alert("相手ターンです");

    try {
      AttackAction.execute(game, frontIndex);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const resolvePendingAttack = (blockerIndex?: number) => {
    if (pendingAttack === null) return;

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