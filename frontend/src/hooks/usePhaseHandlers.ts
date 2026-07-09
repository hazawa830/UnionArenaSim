import type { Game } from "../../../gameEngine/core/Game";
import { ExtraDrawAction } from "../../../gameEngine/actions/ExtraDrawAction";

type Props = {
  game: Game;
  isYourTurn: boolean;
  refresh: () => void;
};

export function usePhaseHandlers({
  game,
  isYourTurn,
  refresh,
}: Props) {
  const handleNextPhase = () => {
    if (!isYourTurn) return alert("相手ターンです");

    try {
      game.nextPhase();
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleExtraDraw = () => {
    if (!isYourTurn) return alert("相手ターンです");

    try {
      ExtraDrawAction.execute(game);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  return {
    handleNextPhase,
    handleExtraDraw,
  };
}