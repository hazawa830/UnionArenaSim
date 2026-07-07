import { CardInstance } from "../cards/CardInstance";
import { EffectTarget } from "./EffectTarget";
import { CardType } from "../enum/CardType";
import { EffectContext } from "./EffectContext";
import { ContinuousEffectResolver } from "./ContinuousEffectResolver";

export class EffectTargetResolver {
    private static resolveCandidatesWithoutSelectedTargets(
  context: EffectContext,
  target: EffectTarget
): CardInstance[] {
  const board =
    target.side === "own" ? context.actor.board : context.opponent.board;

  const targetActor =
    target.side === "own" ? context.actor : context.opponent;

  const targetOpponent =
    target.side === "own" ? context.opponent : context.actor;

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
        const targetContext: EffectContext = {
          game: context.game,
          source: card,
          actor: targetActor,
          opponent: targetOpponent,
          event: context.event,
        };

        const currentBp = ContinuousEffectResolver.getCurrentBp(
          targetContext,
          card
        );

        if (currentBp > target.maxBp) {
          return false;
        }
      }

      return true;
    });
}
    public static resolveCandidates(
    context: EffectContext,
    target: EffectTarget
  ): CardInstance[] {
    const candidates = this.resolveCandidatesWithoutSelectedTargets(
      context,
      target
    );

    const selectedTargets = context.event?.selectedTargets;

    if (!selectedTargets || selectedTargets.length === 0) {
      return candidates;
    }

    return selectedTargets.filter((selected) =>
      candidates.includes(selected)
    );
  }
}