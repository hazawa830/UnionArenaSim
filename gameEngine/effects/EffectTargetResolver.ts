import { Game } from "../core/Game";
import { CardInstance } from "../cards/CardInstance";
import { EffectTarget } from "./EffectTarget";
import { CardType } from "../enum/CardType";

export class EffectTargetResolver {
  public static resolveCandidates(
    game: Game,
    source: CardInstance,
    target: EffectTarget
  ): CardInstance[] {
    const board =
      target.side === "own"
        ? game.getCurrentPlayer().board
        : game.getOpponentPlayer().board;

    const slots =
      target.zone === "field"
        ? [...board.frontLine, ...board.energyLine]
        : target.zone === "frontLine"
          ? board.frontLine
          : board.energyLine;

    return slots
      .map((slot) => slot.getCard())
      .filter((card): card is CardInstance => card !== undefined)
      .filter((card) => {
        if (target.excludeSelf && card === source) {
          return false;
        }

        if (target.cardType === "character") {
          if (card.card.cardType !== CardType.Character) {
            return false;
          }
        }

        if (target.nameFilter && target.nameFilter.length > 0) {
          if (!target.nameFilter.includes(card.card.name)) {
            return false;
          }
        }

        return true;
      });
  }
}