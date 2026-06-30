import { EffectAction } from "./EffectAction";
import { EffectCondition } from "./EffectCondition";
import { EffectTrigger } from "./EffectTrigger";
import { EffectCost } from "./EffectCost";

export type Effect = {

    trigger: EffectTrigger;
    conditions?: EffectCondition[];
    costs?: EffectCost[];
    actions: EffectAction[];
};