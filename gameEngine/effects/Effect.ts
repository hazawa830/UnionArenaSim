import { EffectAction } from "./EffectAction";
import { EffectCondition } from "./EffectCondition";
import { EffectTrigger } from "./EffectTrigger";
import { EffectCost } from "./EffectCost";

export type OncePerTurnScope = "instance" | "cardName" | "player";

export type Effect = {
  id?: string;
  trigger: EffectTrigger;
  oncePerTurn?: {
    scope: OncePerTurnScope;
  };
  conditions?: EffectCondition[];
  costs?: EffectCost[];
  actions: EffectAction[];
};