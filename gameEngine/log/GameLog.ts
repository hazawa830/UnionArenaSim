import { GamePhase } from "../enum/GamePhase";
import { PlayerId } from "../enum/PlayerId";
import { LogType } from "../enum/LogType";

export type GameLog = {
  id: number;
  turn: number;
  phase: GamePhase;
  playerId: string;
  type: LogType;
  message: string;
  payload?: Record<string, unknown>;
};