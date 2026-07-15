import { CardZone } from "../enum/CardZone";
import { Player } from "../core/Player";
import { CardInstance } from "../cards/CardInstance";

export class CardZoneService {
  public static getCards(
    player: Player,
    zone: CardZone
  ): CardInstance[] {
    switch (zone) {
      case CardZone.Hand:
        return player.board.hand;

      case CardZone.Deck:
        return player.board.deck;

      case CardZone.Trash:
        return player.board.trash;

      case CardZone.Remove:
        return player.board.removeArea;

      case CardZone.Life:
        return player.board.lifeArea;

      case CardZone.FrontLine:
        return player.board.frontLine
          .map((slot) => slot.getCard())
          .filter((card): card is CardInstance => card !== undefined);

      case CardZone.EnergyLine:
        return player.board.energyLine
          .map((slot) => slot.getCard())
          .filter((card): card is CardInstance => card !== undefined);
    }
  }
}