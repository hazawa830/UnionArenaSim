import type { Dispatch, SetStateAction } from "react";

import type { Game } from "../../../gameEngine/core/Game";
import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { GamePhase } from "../../../gameEngine/enum/GamePhase";
import { ActivateMainEffectAction } from "../../../gameEngine/actions/ActivateMainEffectAction";

import type { PendingSelection } from "../types/PendingSelection";
import type { PendingActivateMain } from "../types/PendingInteraction";
import { EffectActionFinder } from "../../../gameEngine/effects/EffectActionFinder";

type Props = {
  game: Game;
  isYourTurn: boolean;
  setPendingActivateMain: Dispatch<SetStateAction<PendingActivateMain>>;
  setPendingSelection: Dispatch<SetStateAction<PendingSelection | null>>;
  refresh: () => void;
};

export function useActivateMainHandlers({
  game,
  isYourTurn,
  setPendingActivateMain,
  setPendingSelection,
  refresh,
}: Props) {
  const player1 = game.player1;

  const handleStartActivateMain = (
    sourceLine: BoardLine,
    sourceIndex: number
  ) => {
    if (!isYourTurn) return alert("相手ターンです");
    if (game.phase !== GamePhase.Main) return alert("メインフェーズのみです");

    const sourceSlot =
      sourceLine === BoardLine.FrontLine
        ? player1.board.frontLine[sourceIndex]
        : player1.board.energyLine[sourceIndex];

    const sourceCard = sourceSlot.getCard();

    if (!sourceCard) {
      alert("カードがありません");
      return;
    }

    const activateMainEffect = EffectActionFinder.findActivateMainEffect(sourceCard);

    if (!activateMainEffect) {
      alert("起動メイン効果がありません");
      return;
    }

    const needsSelectedOwnOtherCharacter = activateMainEffect.actions.some(
    (action) =>
        "target" in action && action.target === "selectedOwnOtherCharacter"
    );

    if (needsSelectedOwnOtherCharacter) {
      setPendingActivateMain({
        sourceLine,
        sourceIndex,
      });

      setPendingSelection({
        source: "activateMain",
        requiredCount: 1,
        selectedTargets: [],
        allowedSide: "own",
        allowedLines: [BoardLine.FrontLine, BoardLine.EnergyLine],
      });

      return;
    }

    try {
      ActivateMainEffectAction.execute(game, sourceLine, sourceIndex);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  return {
    handleStartActivateMain,
  };
}