import { Game } from "../core/Game";
import { CardInstance } from "../cards/CardInstance";
import { EffectTrigger } from "./EffectTrigger";
import { Effect } from "./Effect";
import { EffectCondition } from "./EffectCondition";
import { EffectActionExecutor } from "./EffectActionExecutor";
import { EffectContext } from "./EffectContext";
import { EffectConditionResolver } from "./EffectConditionResolver";

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

    const effects = this.getResolvedEffects(context, trigger);

    for (const effect of effects) {
      if (!this.canUseOncePerTurnEffect(context, effect)) {
        continue;
      }
      if (!EffectConditionResolver.checkConditions(context, effect.conditions)) {
        continue;
      }
      this.markOncePerTurnEffectUsed(context, effect);
      this.executeActions(context, effect);
    }
  }

 

  

  private static executeActions(
  context: EffectContext,
  effect: Effect
  ): void {
    for (const action of effect.actions) {
      if (action.type === "grantEffect") {
        continue;
      }

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

    const effects = this.getResolvedEffects(context, trigger);

    for (const effect of effects) {
      if (!this.canUseOncePerTurnEffect(context, effect)) {
        continue;
      }
      if (!EffectConditionResolver.checkConditions(context, effect.conditions)) {
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
private static getResolvedEffects(
  context: EffectContext,
  trigger: EffectTrigger
): Effect[] {
  const baseEffects = context.source.card.effects;

  const grantedEffects = baseEffects.flatMap((effect) => {
    if (!EffectConditionResolver.checkConditions(context, effect.conditions)) {
      return [];
    }

    return effect.actions
      .filter((action) => action.type === "grantEffect")
      .filter((action) => action.target === "self")
      .map((action) => action.effect);
  });

  return [...baseEffects, ...grantedEffects].filter(
    (effect) => effect.trigger === trigger
  );
}
  
}