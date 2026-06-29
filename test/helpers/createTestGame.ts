import { Game } from "../../gameEngine/core/Game";
import { GameFactory } from "../../gameEngine/factory/GameFactory";

export function createTestGame(): Game {
  return GameFactory.createSampleGame();
}