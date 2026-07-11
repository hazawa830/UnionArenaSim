import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { GamePhase } from "../../../gameEngine/enum/GamePhase";
import { PlayCardAction } from "../../../gameEngine/actions/PlayCardAction";
import { MoveCardAction } from "../../../gameEngine/actions/MoveAction";
import type { Game } from "../../../gameEngine/core/Game";
import type { CardInstance } from "../../../gameEngine/cards/CardInstance";

type Props = {
  game: Game;
  isYourTurn: boolean;
  refresh: () => void;
  startModifyBpTargetSelection: (sourceCard: CardInstance) => boolean;
  startSearchTopDeckChoice: (
    sourceCard: CardInstance,
    options?: { handIndex?: number }
  ) => boolean;
};

export function usePlayHandlers({
  game,
  isYourTurn,
  refresh,
  startModifyBpTargetSelection,
  startSearchTopDeckChoice,
}: Props) {
  const player1 = game.player1;

  const handlePlayCard = (
    handIndex: number,
    destinationLine: BoardLine
  ) => {
    if (!isYourTurn) return alert("相手ターンです");

    try {
      const playedCard = PlayCardAction.execute(
        game,
        handIndex,
        destinationLine,
        undefined,
        {
          skipSelectableModifyBp: true,
        }
      );

      if (startModifyBpTargetSelection(playedCard)) {
        return;
      }

      const startedSearch = startSearchTopDeckChoice(playedCard);

      if (!startedSearch) {
        refresh();
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handlePlayToEnergy = (handIndex: number) => {
    handlePlayCard(handIndex, BoardLine.EnergyLine);
  };

  const handlePlayToFront = (handIndex: number) => {
    handlePlayCard(handIndex, BoardLine.FrontLine);
  };
  const handleMoveToEnergy = (frontIndex: number) => {
  if (!isYourTurn) return alert("相手ターンです");
  if (game.phase !== GamePhase.Move) return alert("移動フェーズのみです");

  const sourceSlot = player1.board.frontLine[frontIndex];
  const sourceCard = sourceSlot?.getCard();

  if (!sourceCard) {
    alert("カードがありません");
    return;
  }

  if (!sourceCard.card.hasKeyword("step")) {
    alert("ステップを持たないカードはエナジーラインに移動できません");
    return;
  }

  const emptyEnergyIndex = player1.board.energyLine.findIndex((slot) =>
    slot.isEmpty()
  );

  if (emptyEnergyIndex === -1) {
    alert("エナジーラインに空きがありません");
    return;
  }

  try {
    MoveCardAction.execute(
      game,
      BoardLine.FrontLine,
      frontIndex,
      BoardLine.EnergyLine,
      emptyEnergyIndex
    );

    refresh();
  } catch (e) {
    alert(e instanceof Error ? e.message : String(e));
  }
};
  const handleMoveToFront = (energyIndex: number) => {
  if (!isYourTurn) return alert("相手ターンです");
  if (game.phase !== GamePhase.Move) return alert("移動フェーズのみです");

  const emptyFrontIndex = player1.board.frontLine.findIndex((slot) =>
    slot.isEmpty()
  );

  if (emptyFrontIndex === -1) {
    alert("フロントラインに空きがありません");
    return;
  }

  try {
    MoveCardAction.execute(
      game,
      BoardLine.EnergyLine,
      energyIndex,
      BoardLine.FrontLine,
      emptyFrontIndex
    );

    refresh();
  } catch (e) {
    alert(e instanceof Error ? e.message : String(e));
  }
};

  return {
    handlePlayToEnergy,
    handlePlayToFront,
    handleMoveToFront,
    handleMoveToEnergy,
  };
}