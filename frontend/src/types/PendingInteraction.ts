import type { CardInstance } from "../../../gameEngine/cards/CardInstance";
import { BoardLine } from "../../../gameEngine/enum/BoardLine";

export type PendingRaid = {
  handIndex: number;
} | null;

export type PendingRaidBase = {
  handIndex: number;
  baseLine: BoardLine;
  baseIndex: number;
} | null;

export type PendingRaidTriggerBase = {
  baseLine: BoardLine;
  baseIndex: number;
} | null;

export type PendingActivateMain = {
  sourceLine: BoardLine;
  sourceIndex: number;
  skipCosts?: boolean;
} | null;

export type PendingPlayDestination = {
  sourceCard: CardInstance;
  playedCard: CardInstance;
  allowedLines: BoardLine[];
  rest: boolean;
  playerId: string;
} | null;