import { describe, it, expect } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { TestCardFactory } from "../helpers/TestCardFactory";
import { advanceToMovePhase } from "../helpers/gamePhaseHelper";

import { BoardLine } from "../../gameEngine/enum/BoardLine";
import { MoveCardAction } from "../../gameEngine/actions/MoveAction";

describe("Keyword: step", () => {
  it("stepを持たないキャラはフロントラインからエナジーラインへ移動できない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMovePhase(game);

    const character = TestCardFactory.createCharacter({
      name: "通常キャラ",
      bp: 3000,
    });

    player.board.frontLine[0].setCard(character);

    expect(() => {
      MoveCardAction.execute(
        game,
        BoardLine.FrontLine,
        0,
        BoardLine.EnergyLine,
        0
      );
    }).toThrow("Only step characters can move from front line to energy line.");

    expect(player.board.frontLine[0].getCard()).toBe(character);
    expect(player.board.energyLine[0].isEmpty()).toBe(true);
  });

  it("stepを持つキャラはフロントラインからエナジーラインへ移動できる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMovePhase(game);

    const character = TestCardFactory.createCharacter({
      name: "ステップ持ちキャラ",
      bp: 3000,
      keywords: [
        {
          type: "step",
        },
      ],
    });

    player.board.frontLine[0].setCard(character);

    MoveCardAction.execute(
      game,
      BoardLine.FrontLine,
      0,
      BoardLine.EnergyLine,
      0
    );

    expect(player.board.frontLine[0].isEmpty()).toBe(true);
    expect(player.board.energyLine[0].getCard()).toBe(character);
  });
});
