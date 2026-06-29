import { describe, it, expect } from "vitest";
import { PlayCardAction} from "../gameEngine/actions/PlayCardAction";
import { EnergyColor } from "../gameEngine/enum/EnergyColor";
import { createTestGame } from "./helpers/createTestGame";
import {advanceToMainPhase,} from "./helpers/gamePhaseHelper";
import { BoardLine } from "../gameEngine/enum/BoardLine";
describe("PlayCardAction", () => {
  it("手札のカードをエナジーラインとフロントラインにプレイできる", () => {
    const game = createTestGame();

    const currentPlayer = game.getCurrentPlayer();
    expect(currentPlayer.board.hand.length).toBe(7);
    expect(currentPlayer.board.deck.length).toBe(36);
    expect(currentPlayer.board.lifeArea.length).toBe(7);
    expect(currentPlayer.board.activeActionPoint).toBe(1);
    advanceToMainPhase(game);
    currentPlayer.board.setActionPoint(3);
    PlayCardAction.execute(game, 0, BoardLine.EnergyLine);

    expect(currentPlayer.board.hand.length).toBe(6);
    expect(currentPlayer.board.energyLine[0].getCard()?.card.name).toBe("ロキ");
    expect(currentPlayer.board.activeActionPoint).toBe(2);

    PlayCardAction.execute(game, 0, BoardLine.FrontLine);

    expect(currentPlayer.board.hand.length).toBe(5);
    expect(currentPlayer.board.frontLine[0].getCard()?.card.name).toBe("ロキ");
    expect(currentPlayer.board.getGeneratedEnergy().get(EnergyColor.Blue)).toBe(1);
    expect(currentPlayer.board.activeActionPoint).toBe(1);
  });
});