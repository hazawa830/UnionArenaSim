import { EffectAction } from "./EffectAction";
import { EffectCondition } from "./EffectCondition";
import { EffectTrigger } from "./EffectTrigger";

export type Effect = {

    trigger: EffectTrigger;

    conditions?: EffectCondition[];

    actions: EffectAction[];
};