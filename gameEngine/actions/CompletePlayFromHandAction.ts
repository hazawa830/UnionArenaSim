import { Game } from "../core/Game";
import { CardInstance } from "../cards/CardInstance";
import { BoardLine } from "../enum/BoardLine";
import { EffectResolver } from "../effects/EffectResolver";
import { EffectTrigger } from "../effects/EffectTrigger";
import { GameLogger } from "../log/GameLogger";
import { LogType } from "../enum/LogType";
import { EffectLogType } from "../enum/EffectLogType";

export class CompletePlayFromHandAction {
  public static execute(
    game: Game,
    sourceCard: CardInstance,
    playedCard: CardInstance,
    destinationLine: BoardLine,
    rest: boolean,
    actorPlayerId?: string
  ): void {
    const player =
    actorPlayerId === game.player1.id
      ? game.player1
      : actorPlayerId === game.player2.id
        ? game.player2
        : game.getCurrentPlayer();

  const opponent =
    player === game.player1 ? game.player2 : game.player1;
    const board = player.board;

    const handIndex = board.hand.findIndex((card) => card === playedCard);

    if (handIndex === -1) {
      throw new Error("Selected card is not in hand.");
    }

    const destinationSlot =
      destinationLine === BoardLine.FrontLine
        ? board.getEmptyFrontSlot()
        : board.getEmptyEnergySlot();

    if (!destinationSlot) {
      throw new Error(`No empty slot in ${destinationLine}.`);
    }

    board.hand.splice(handIndex, 1);

    playedCard.isRest = rest;
    destinationSlot.setCard(playedCard);

    GameLogger.add(game, {
      playerId: player.id,
      type: LogType.Effect,
      message: `${playedCard.card.name}を手札から${destinationLine}へ登場`,
      payload: {
        effectType: EffectLogType.PlayFromHand,
        sourceInstanceId: sourceCard.instanceId,
        sourceCardId: sourceCard.card.id,
        sourceCardName: sourceCard.card.name,
        playedInstanceId: playedCard.instanceId,
        playedCardId: playedCard.card.id,
        playedCardName: playedCard.card.name,
        destination: destinationLine,
        isRest: playedCard.isRest,
      },
    });

    EffectResolver.resolve(
      game,
      playedCard,
      EffectTrigger.OnPlay,
      player,
      opponent
    );
  }
}