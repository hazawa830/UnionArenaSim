
import { CardInstance } from "../cards/CardInstance";
import { EffectTarget } from "./EffectTarget";
import { CardType } from "../enum/CardType";

import { EffectContext } from "./EffectContext";

export class EffectTargetResolver {
  public static resolveCandidates(
  context: EffectContext,
  target: EffectTarget
): CardInstance[] {
  const board =
    target.side === "own"
      ? context.actor.board
      : context.opponent.board;

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
        if (target.excludeSelf && card === context.source) {
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
        if (target.maxBp !== undefined) {
          if (card.getCurrentBp() > target.maxBp)
              return false;
        }

        return true;
      });
  }
}