import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import {
  advanceToMainPhase,
  advanceToAttackPhase,
} from "./helpers/gamePhaseHelper";
import { TestCardFactory } from "./helpers/TestCardFactory";

import { BoardLine } from "../gameEngine/enum/BoardLine";
import { TriggerType } from "../gameEngine/enum/TriggerType";

import { PlayCardAction } from "../gameEngine/actions/PlayCardAction";
import { AttackAction } from "../gameEngine/actions/AttackAction";
import { ResolveTriggerChoiceAction } from "../gameEngine/actions/ResolveTriggerChoiceAction";

function setupAttackScenario(triggerType: TriggerType) {
  const game = createTestGame();

  const attackerPlayer = game.getCurrentPlayer();
  const defenderPlayer = game.getOpponentPlayer();

  advanceToMainPhase(game);

  attackerPlayer.board.setActionPoint(3);
  PlayCardAction.execute(game, 0, BoardLine.EnergyLine);
  PlayCardAction.execute(game, 0, BoardLine.FrontLine);

  attackerPlayer.board.activateAllCards();

  const triggerCard = TestCardFactory.createTriggerCard(triggerType);

  defenderPlayer.board.lifeArea[
    defenderPlayer.board.lifeArea.length - 1
  ] = triggerCard;

  advanceToAttackPhase(game);

  return { game, attackerPlayer, defenderPlayer, triggerCard };
}

describe("TriggerAction", () => {
  it("Noneトリガーは公開カードをトラッシュへ置く", () => {
    const { game, defenderPlayer, triggerCard } =
      setupAttackScenario(TriggerType.None);

    const lifeBefore = defenderPlayer.board.lifeArea.length;
    const trashBefore = defenderPlayer.board.trash.length;

    AttackAction.execute(game, 0);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore - 1);
    expect(defenderPlayer.board.trash.length).toBe(trashBefore + 1);
    expect(defenderPlayer.board.trash).toContain(triggerCard);
  });

  it("Drawトリガーは1枚引いて公開カードをトラッシュへ置く", () => {
    const { game, defenderPlayer, triggerCard } =
      setupAttackScenario(TriggerType.Draw);

    const handBefore = defenderPlayer.board.hand.length;
    const deckBefore = defenderPlayer.board.deck.length;
    const trashBefore = defenderPlayer.board.trash.length;

    AttackAction.execute(game, 0);

    expect(defenderPlayer.board.hand.length).toBe(handBefore + 1);
    expect(defenderPlayer.board.deck.length).toBe(deckBefore - 1);
    expect(defenderPlayer.board.trash.length).toBe(trashBefore + 1);
    expect(defenderPlayer.board.trash).toContain(triggerCard);
  });

  it("Getトリガーは公開カードをトラッシュではなく手札に加える", () => {
    const { game, defenderPlayer, triggerCard } =
      setupAttackScenario(TriggerType.Get);

    const handBefore = defenderPlayer.board.hand.length;
    const trashBefore = defenderPlayer.board.trash.length;

    AttackAction.execute(game, 0);

    expect(defenderPlayer.board.hand.length).toBe(handBefore + 1);
    expect(defenderPlayer.board.hand).toContain(triggerCard);
    expect(defenderPlayer.board.trash.length).toBe(trashBefore);
    expect(defenderPlayer.board.trash).not.toContain(triggerCard);
  });

  it("Activeトリガーは自分のキャラクター1体にこのターン中BP+3000する", () => {
    const { game, defenderPlayer } = setupAttackScenario(TriggerType.Active);

    const target = TestCardFactory.createCharacter({
      name: "防御側キャラ",
      bp: 2000,
    });

    target.isRest = false;
    defenderPlayer.board.frontLine[0].setCard(target);

    expect(target.temporaryBpBonus).toBe(0);

    AttackAction.execute(game, 0);

    expect(game.pendingTriggerChoice).toBeDefined();

    ResolveTriggerChoiceAction.execute(game, [target]);

    expect(target.temporaryBpBonus).toBe(3000);
    expect(game.pendingTriggerChoice).toBeUndefined();
  });

  it("Color青トリガーは相手フロントラインのBP3500以下のキャラを手札に戻す", () => {
  const { game, attackerPlayer } = setupAttackScenario(TriggerType.Color);

  const attacker = attackerPlayer.board.frontLine[0].getCard();
  expect(attacker).toBeDefined();

  const attackerHandBefore = attackerPlayer.board.hand.length;

  AttackAction.execute(game, 0);

  expect(game.pendingTriggerChoice).toBeDefined();
  expect(game.pendingTriggerChoice?.triggerType).toBe(TriggerType.Color);

  ResolveTriggerChoiceAction.execute(game, [attacker!]);

  expect(attackerPlayer.board.frontLine[0].isEmpty()).toBe(true);
  expect(attackerPlayer.board.hand.length).toBe(attackerHandBefore + 1);
  expect(attackerPlayer.board.hand).toContain(attacker);
});
  it("Finalトリガーはライフが0の場合、山札の上から1枚をライフに置く", () => {
    const { game, defenderPlayer, triggerCard } =
      setupAttackScenario(TriggerType.Final);

    defenderPlayer.board.lifeArea.splice(0, defenderPlayer.board.lifeArea.length);
    defenderPlayer.board.lifeArea.push(triggerCard);

    const deckBefore = defenderPlayer.board.deck.length;

    AttackAction.execute(game, 0);

    expect(defenderPlayer.board.lifeArea.length).toBe(1);
    expect(defenderPlayer.board.deck.length).toBe(deckBefore - 1);
    expect(defenderPlayer.board.trash).toContain(triggerCard);
    expect(game.winner).toBeUndefined();
  });
  it("Specialトリガーは相手フロントラインのキャラ1枚を退場させる", () => {
  const { game, attackerPlayer, defenderPlayer, triggerCard } =
    setupAttackScenario(TriggerType.Special);

  const target = TestCardFactory.createCharacter({
    name: "退場対象",
    bp: 3000,
  });

  attackerPlayer.board.frontLine[1].setCard(target);

  const attacker = attackerPlayer.board.frontLine[0].getCard()!;
  expect(attacker).toBeDefined();

  AttackAction.execute(game, 0);

  expect(game.pendingTriggerChoice).toBeDefined();

  ResolveTriggerChoiceAction.execute(game, [attacker]);

  expect(attackerPlayer.board.frontLine[0].isEmpty()).toBe(true);
  expect(attackerPlayer.board.trash).toContain(attacker);
  expect(game.pendingTriggerChoice).toBeUndefined();
});


});