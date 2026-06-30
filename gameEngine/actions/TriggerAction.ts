import { Game } from "../core/Game";
import { Player } from "../core/Player";
import { CardInstance } from "../cards/CardInstance";
import { TriggerType } from "../enum/TriggerType";
import { CharacterCard } from "../cards/CharacterCard";

export class TriggerAction {
  public static resolve(
    game: Game,
    revealedCard: CardInstance,
    damagedPlayer: Player,
    opponentPlayer: Player
  ): void {
    switch (revealedCard.card.triggerType) {
      case TriggerType.Draw:
        damagedPlayer.board.draw(1);
        damagedPlayer.board.trash.push(revealedCard);
        break;

      case TriggerType.Get:
        damagedPlayer.board.hand.push(revealedCard);
        break;

      case TriggerType.Active:
        this.resolveActiveTrigger(damagedPlayer);
        damagedPlayer.board.trash.push(revealedCard);
        break;

      case TriggerType.Color:
        this.resolveColorTrigger(revealedCard, damagedPlayer, opponentPlayer);
        damagedPlayer.board.trash.push(revealedCard);
        break;
      case TriggerType.Final:
        this.resolveFinalTrigger(damagedPlayer);
        damagedPlayer.board.trash.push(revealedCard);
        break;
      case TriggerType.None:
      default:
        damagedPlayer.board.trash.push(revealedCard);
        break;
    }
  }

  private static resolveActiveTrigger(player: Player): void {
    const targetSlot = player.board.frontLine.find((slot) => {
      const card = slot.getCard();
      return card && card.card instanceof CharacterCard;
    });

    const target = targetSlot?.getCard();

    if (!target) {
      return;
    }

    target.temporaryBpBonus += 3000;
  }

  private static resolveColorTrigger(
    revealedCard: CardInstance,
    damagedPlayer: Player,
    opponentPlayer: Player
  ): void {
    if (revealedCard.card.color !== "blue") {
      return;
    }

    const targetIndex = opponentPlayer.board.frontLine.findIndex((slot) => {
      const card = slot.getCard();

      if (!card || !(card.card instanceof CharacterCard)) {
        return false;
      }

      return card.card.bp + card.temporaryBpBonus <= 3500;
    });

    if (targetIndex === -1) {
      return;
    }

    const returned = opponentPlayer.board.frontLine[targetIndex].removeCard();

    if (returned) {
      opponentPlayer.board.hand.push(returned);
    }
  }
  private static resolveFinalTrigger(player: Player): void {
    if (player.board.lifeArea.length > 0) {
      return;
    }

    const lifeCard = player.board.deck.pop();

    if (!lifeCard) {
      return;
    }

    player.board.lifeArea.push(lifeCard);
  }
}