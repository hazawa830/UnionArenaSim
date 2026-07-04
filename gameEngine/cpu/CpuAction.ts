import { BoardLine } from "../enum/BoardLine";
import { AttackTarget } from "../actions/AttackTarget";

export type CpuAction =
  | {
      type: "move";
      fromLine: BoardLine;
      fromIndex: number;
      toLine: BoardLine;
      toIndex: number;
    }
  | {
      type: "playCard";
      handIndex: number;
      destination: BoardLine;
    }
  | {
      type: "useEvent";
      handIndex: number;
    }
  | {
      type: "raidPlay";
      handIndex: number;
      baseLine: BoardLine;
      baseIndex: number;
      destinationFrontIndex?: number;
    }
  | {
      type: "activateMain";
      sourceLine: BoardLine;
      sourceIndex: number;
      targetLine?: BoardLine;
      targetIndex?: number;
    }
  | {
      type: "attack";
      attackerIndex: number;
      blockerIndex?: number;
      attackTarget?: AttackTarget;
    }
  | {
      type: "endPhase";
    };