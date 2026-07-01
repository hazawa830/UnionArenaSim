import { Game } from "../core/Game";
import { GamePhase } from "../enum/GamePhase";
import { CardType } from "../enum/CardType";
import { EffectTrigger } from "../effects/EffectTrigger";
import { EffectResolver } from "../effects/EffectResolver";

export class UseEventCardAction {
  public static execute(game: Game, handIndex: number): void {
    if (game.phase !== GamePhase.Main) {
      throw new Error("Event card can only be used in main phase.");
    }

    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();
    const board = player.board;

    const cardInstance = board.hand[handIndex];

    if (!cardInstance) {
      throw new Error("Invalid hand index.");
    }

    if (cardInstance.card.cardType !== CardType.Event) {
      throw new Error("Selected card is not an event card.");
    }

    const canPayEnergy = board
      .getGeneratedEnergy()
      .canPay(cardInstance.card.requiredEnergy);

    if (!canPayEnergy) {
      throw new Error("Not enough energy.");
    }

    if (board.activeActionPoint < cardInstance.card.actionPointCost) {
      throw new Error("Not enough action points.");
    }

    board.payActionPoint(cardInstance.card.actionPointCost);

    board.hand.splice(handIndex, 1);

    EffectResolver.resolve(
      game,
      cardInstance,
      EffectTrigger.OnUse,
      player,
      opponent
    );

    board.trash.push(cardInstance);
  }
}