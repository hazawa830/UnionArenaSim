import type { CardInstance } from "../../../gameEngine/cards/CardInstance";
import { BoardLine } from "../../../gameEngine/enum/BoardLine";

export type PendingSelectionSource =
  | "event"
  | "activateMain"
  | "trigger"
  | "effect";

export type TargetSide = "own" | "opponent" | "both";

export type PendingSelection = {
  source: PendingSelectionSource;
  handIndex?: number;
  requiredCount: number;
  selectedTargets: CardInstance[];
  allowedSide: TargetSide;
  allowedLines: BoardLine[];
  sourceCard?: CardInstance;
};