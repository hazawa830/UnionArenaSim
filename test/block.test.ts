import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { advanceToMainPhase, advanceToAttackPhase } from "./helpers/gamePhaseHelper";

import { BoardLine } from "../gameEngine/enum/BoardLine";
import { ActionSource } from "../gameEngine/enum/ActionSource";
import { PlayCardAction } from "../gameEngine/actions/PlayCardAction";
import { AttackAction } from "../gameEngine/actions/AttackAction";

function setupBattleField() {
  const game = createTestGame();

  const attackerPlayer = game.getCurrentPlayer();
  const blockerPlayer = game.getOpponentPlayer();

  advanceToMainPhase(game);

  attackerPlayer.board.setActionPoint(3);
  PlayCardAction.execute(game, 0, BoardLine.EnergyLine);
  PlayCardAction.execute(game, 0, BoardLine.FrontLine);

  // 相手側にもブロッカーを直接用意する
  const blocker = blockerPlayer.board.hand[0];
  blockerPlayer.board.hand.splice(0, 1);
  blocker.isRest = false;
  blockerPlayer.board.frontLine[0].setCard(blocker);

  // プレイしたカードはレスト登場なので、攻撃できるように起こす
  attackerPlayer.board.activateAllCards();
  blockerPlayer.board.activateAllCards();

  advanceToAttackPhase(game);

  return { game, attackerPlayer, blockerPlayer };
}

describe("Block", () => {
  it("ブロックしない場合、相手ライフが1減る", () => {
    const { game, blockerPlayer } = setupBattleField();

    const lifeBefore = blockerPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0);

    expect(blockerPlayer.board.lifeArea.length).toBe(lifeBefore - 1);
    expect(blockerPlayer.board.trash.length).toBe(1);
  });

  it("攻撃BP >= ブロックBP の場合、ライフは減らずブロックキャラがトラッシュへ行く", () => {
    const { game, blockerPlayer } = setupBattleField();

    const lifeBefore = blockerPlayer.board.lifeArea.length;
    const trashBefore = blockerPlayer.board.trash.length;

    AttackAction.execute(game, 0, 0);

    expect(blockerPlayer.board.lifeArea.length).toBe(lifeBefore);
    expect(blockerPlayer.board.frontLine[0].isEmpty()).toBe(true);
    expect(blockerPlayer.board.trash.length).toBe(trashBefore + 1);
  });

  it("カード効果扱いでもブロックあり攻撃を解決できる", () => {
    const { game, blockerPlayer } = setupBattleField();

    const lifeBefore = blockerPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0, 0, ActionSource.CardEffect);

    expect(blockerPlayer.board.lifeArea.length).toBe(lifeBefore);
  });
});