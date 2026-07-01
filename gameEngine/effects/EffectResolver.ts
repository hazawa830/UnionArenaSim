import { Game } from "../core/Game";
import { CardInstance } from "../cards/CardInstance";
import { EffectTrigger } from "./EffectTrigger";
import { Effect } from "./Effect";
import { EffectCondition } from "./EffectCondition";
import { EffectActionExecutor } from "./EffectActionExecutor";
import { EffectContext } from "./EffectContext";

export class EffectResolver {
  public static resolve(
    game: Game,
    source: CardInstance,
    trigger: EffectTrigger,
    actor = game.getCurrentPlayer(),
    opponent = game.getOpponentPlayer()
  ): void {
    const context: EffectContext = {
      game,
      source,
      actor,
      opponent,
    };

    const effects = source.card.effects.filter(
      (effect) => effect.trigger === trigger
    );

    for (const effect of effects) {
      if (!this.canUseOncePerTurnEffect(context, effect)) {
        continue;
      }
      if (!this.checkConditions(context, effect)) {
        continue;
      }
      this.markOncePerTurnEffectUsed(context, effect);
      this.executeActions(context, effect);
    }
  }

  private static checkConditions(
    context: EffectContext,
    effect: Effect
  ): boolean {
    if (!effect.conditions || effect.conditions.length === 0) {
      return true;
    }

    return effect.conditions.every((condition) =>
      this.checkCondition(context, condition)
    );
  }

  private static checkCondition(
    context: EffectContext,
    condition: EffectCondition
  ): boolean {
    switch (condition.type) {
      case "hasCharacterNamesOnField": {
        const board = context.actor.board;

        const fieldNames = [...board.frontLine, ...board.energyLine]
          .map((slot) => slot.getCard()?.card.name)
          .filter((name): name is string => name !== undefined);

        if (condition.mode === "all") {
          return condition.names.every((name) => fieldNames.includes(name));
        }

        return condition.names.some((name) => fieldNames.includes(name));
      }

      case "isOnLine": {
        const board = context.actor.board;

        const line =
          condition.line === "frontLine"
            ? board.frontLine
            : board.energyLine;

        return line.some((slot) => slot.getCard() === context.source);
      }
      case "attackerNameIs": {
        const attacker = context.event?.attacker;

        if (!attacker) {
          return false;
        }

        return condition.names.includes(attacker.card.name);
      }
      case "hasCharacterNamesOnFrontLine": {
        const fieldNames = context.actor.board.frontLine
          .map((slot) => slot.getCard()?.card.name)
          .filter((name): name is string => name !== undefined);

        if (condition.mode === "all") {
          return condition.names.every((name) => fieldNames.includes(name));
        }

        return condition.names.some((name) => fieldNames.includes(name));
      }
      default:
        throw new Error(`Unknown effect condition: ${(condition as any).type}`);
    }
  }

  private static executeActions(
    context: EffectContext,
    effect: Effect
  ): void {
    for (const action of effect.actions) {
      EffectActionExecutor.execute(context, action);
    }
  }
  public static resolveForField(
  game: Game,
  trigger: EffectTrigger,
  actor = game.getCurrentPlayer(),
  opponent = game.getOpponentPlayer(),
  event?: EffectContext["event"]
): void {
  const fieldCards = [
    ...actor.board.frontLine,
    ...actor.board.energyLine,
  ]
    .map((slot) => slot.getCard())
    .filter((card): card is CardInstance => card !== undefined);

  for (const card of fieldCards) {
    const context: EffectContext = {
      game,
      source: card,
      actor,
      opponent,
      event,
    };

    const effects = card.card.effects.filter(
      (effect) => effect.trigger === trigger
    );

    for (const effect of effects) {
      if (!this.canUseOncePerTurnEffect(context, effect)) {
        continue;
      }
      if (!this.checkConditions(context, effect)) {
        continue;
      }
      this.markOncePerTurnEffectUsed(context, effect);
      this.executeActions(context, effect);
    }
  }
}
private static getOncePerTurnKey(
  context: EffectContext,
  effect: Effect
): string {
  if (!effect.id) {
    throw new Error("oncePerTurn effect must have id.");
  }

  return `${context.source.card.name}:${effect.id}`;
}

private static canUseOncePerTurnEffect(
  context: EffectContext,
  effect: Effect
): boolean {
  if (!effect.oncePerTurn) {
    return true;
  }

  if (!effect.id) {
    throw new Error("oncePerTurn effect must have id.");
  }

  if (effect.oncePerTurn.scope === "instance") {
    return !context.source.usedEffectIdsThisTurn.has(effect.id);
  }

  if (effect.oncePerTurn.scope === "cardName") {
    const key = this.getOncePerTurnKey(context, effect);
    return !context.actor.board.usedCardNameEffectIdsThisTurn.has(key);
  }

  throw new Error(`Unsupported oncePerTurn scope: ${effect.oncePerTurn.scope}`);
}

private static markOncePerTurnEffectUsed(
  context: EffectContext,
  effect: Effect
): void {
  if (!effect.oncePerTurn) {
    return;
  }

  if (!effect.id) {
    throw new Error("oncePerTurn effect must have id.");
  }

  if (effect.oncePerTurn.scope === "instance") {
    context.source.usedEffectIdsThisTurn.add(effect.id);
    return;
  }

  if (effect.oncePerTurn.scope === "cardName") {
    const key = this.getOncePerTurnKey(context, effect);
    context.actor.board.usedCardNameEffectIdsThisTurn.add(key);
    return;
  }

  throw new Error(`Unsupported oncePerTurn scope: ${effect.oncePerTurn.scope}`);
}
}