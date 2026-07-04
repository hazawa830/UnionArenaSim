import { TargetType } from "./TargetType";
import { EffectTarget } from "./EffectTarget";
import { Effect } from "./Effect";

export type EffectAction =
  | {
      type: "draw";
      count: number;
    }
  | {
      type: "activate";
      target: TargetType | EffectTarget;
      count?: number;
    }
  | {
      type: "modifyBpThisTurn";
      target: TargetType | EffectTarget;
      amount: number;
    }
  | {
      type: "searchTopDeck";
      lookCount: number;
      takeCount: number;
      target: {
        cardType?: "character" | "event" | "stage";
        nameFilter?: string[];
      };
      restToBottom: boolean;
      ifTaken?: EffectAction[];
    }
  | {
      type: "discardHand";
      count: number;
    }
  | {
        type:"destroy",
        target: EffectTarget
    }
  | {
    type: "modifyBpContinuous";
    target: "self";
    amount: number;
  }
  | {
    type: "grantEffect";
    target: "self";
    effect: Effect;
  }
   | {
      type: "playFromHand";
      target: {
        cardType?: "character" | "stage" | "event";
        names?: string[];
        color?: string;
        maxRequiredEnergyTotal?: number;
        actionPointCost?: number;
      };
      destination: "frontLine" | "energyLine";
      rest?: boolean;
      maxCount?: number;
      optional?: boolean;
    };;
  
  
    