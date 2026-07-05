import { Game } from "../../gameEngine/core/Game";
import { TestGameFactory } from "./testCameFactory";

export function createTestGame(): Game {
  return TestGameFactory.createSampleGame();
}