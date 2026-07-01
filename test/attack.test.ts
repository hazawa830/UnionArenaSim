import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { PlayCardAction} from "../gameEngine/actions/PlayCardAction";
import { AttackAction } from "../gameEngine/actions/AttackAction";
import { BoardLine } from "../gameEngine/enum/BoardLine";
import {advanceToMainPhase,advanceToAttackPhase} from "./helpers/gamePhaseHelper";
import { TestCardFactory } from "./helpers/TestCardFactory";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";

describe("AttackAction", () => {
  it("フロントラインのアクティブなカードで攻撃すると相手ライフが1減り、攻撃したカードはレストする", () => {
    const game = createTestGame();

    const currentPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();
    advanceToMainPhase(game); 

    
    PlayCardAction.execute(game, 0, BoardLine.FrontLine);

    expect(opponentPlayer.board.lifeArea.length).toBe(7);
    expect(currentPlayer.board.frontLine[0].getCard()?.isRest).toBe(true);
    advanceToAttackPhase(game)
    currentPlayer.board.activateAllCards();
    AttackAction.execute(game, 0);

    expect(opponentPlayer.board.lifeArea.length).toBe(6);
    expect(opponentPlayer.board.trash.length).toBe(1);
    expect(currentPlayer.board.frontLine[0].getCard()?.isRest).toBe(true);
  });

  it("レストしているカードでは攻撃できない", () => {
    const game = createTestGame();
    advanceToMainPhase(game); 
    
    PlayCardAction.execute(game, 0, BoardLine.FrontLine);
    advanceToAttackPhase(game)
    game.player1.board.activateAllCards();
    game.player2.board.activateAllCards();
    AttackAction.execute(game, 0);

    expect(() => {
      AttackAction.execute(game, 0);
    }).toThrow("Rested card cannot attack.");
  });

  it("攻撃で相手ライフが0になると勝者が設定される", () => {
    const game = createTestGame();

    const currentPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();
    advanceToMainPhase(game); 
    
    PlayCardAction.execute(game, 0, BoardLine.FrontLine);

    opponentPlayer.board.lifeArea.splice(0, opponentPlayer.board.lifeArea.length - 1);

    expect(opponentPlayer.board.lifeArea.length).toBe(1);
    advanceToAttackPhase(game)
    currentPlayer.board.activateAllCards();
    AttackAction.execute(game, 0);

    expect(opponentPlayer.board.lifeArea.length).toBe(0);
    expect(game.winner).toBe(game.currentPlayerId);
  });
    it("BP4000以上のキャラはブロックできない", () => {
    const game = createTestGame();

    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 4000,
    });

    attacker.cannotBeBlockedByMinBp = 4000;

    const blocker = TestCardFactory.createCharacter({
      name: "ブロッカー",
      bp: 4000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    expect(() =>
      AttackAction.execute(game, 0, 0)
    ).toThrow("This attacker cannot be blocked by this blocker.");

    // ブロックは成立していない
    expect(blocker.isRest).toBe(false);

    // 攻撃側もバトル処理されていない
    expect(defenderPlayer.board.trash).toHaveLength(0);
  });
  it("BP3999以下のキャラはブロックできる", () => {
    const game = createTestGame();

    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 4000,
    });

    attacker.cannotBeBlockedByMinBp = 4000;

    const blocker = TestCardFactory.createCharacter({
      name: "ブロッカー",
      bp: 3999,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    expect(() => AttackAction.execute(game, 0, 0)).not.toThrow();

    // ブロックが成立している
    expect(blocker.isRest).toBe(true);

    // 4000 >= 3999 なのでブロッカーは退場
    expect(defenderPlayer.board.frontLine[0].isEmpty()).toBe(true);
    expect(defenderPlayer.board.trash).toContain(blocker);

    // 攻撃側は場に残る
    expect(attackerPlayer.board.frontLine[0].getCard()).toBe(attacker);
  });
  it("バトルに勝利した時、OnBattleWin効果が発動して1枚引く", () => {
    const game = createTestGame();

    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 5000,
    });

    const blocker = TestCardFactory.createCharacter({
      name: "ブロッカー",
      bp: 3000,
    });

    const support = TestCardFactory.createCharacter({
      name: "サポート",
      bp: 1000,
      effects: [
        {
          id: "battleWinDraw",
          trigger: EffectTrigger.OnBattleWin,
          conditions: [
            {
              type: "attackerNameIs",
              names: ["花海 咲季"],
            },
          ],
          actions: [
            {
              type: "draw",
              count: 1,
            },
          ],
        },
      ],
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    attackerPlayer.board.frontLine[1].setCard(support);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    const handBefore = attackerPlayer.board.hand.length;
    const deckBefore = attackerPlayer.board.deck.length;

    AttackAction.execute(game, 0, 0);

    expect(attackerPlayer.board.hand.length).toBe(handBefore + 1);
    expect(attackerPlayer.board.deck.length).toBe(deckBefore - 1);

    expect(defenderPlayer.board.frontLine[0].isEmpty()).toBe(true);
    expect(defenderPlayer.board.trash).toContain(blocker);
  });
  it("attackerNameが違う場合、OnBattleWin効果は発動しない", () => {
  const game = createTestGame();

  const attackerPlayer = game.getCurrentPlayer();
  const defenderPlayer = game.getOpponentPlayer();

  advanceToAttackPhase(game);

  const attacker = TestCardFactory.createCharacter({
    name: "花海 咲季",
    bp: 5000,
  });

  const blocker = TestCardFactory.createCharacter({
    name: "ブロッカー",
    bp: 3000,
  });

  const support = TestCardFactory.createCharacter({
    name: "サポート",
    bp: 1000,
    effects: [
      {
        id: "battleWinDraw",
        trigger: EffectTrigger.OnBattleWin,
        conditions: [
          {
            type: "attackerNameIs",
            names: ["藤田 ことね"],
          },
        ],
        actions: [
          {
            type: "draw",
            count: 1,
          },
        ],
      },
    ],
  });

  attackerPlayer.board.frontLine[0].setCard(attacker);
  attackerPlayer.board.frontLine[1].setCard(support);
  defenderPlayer.board.frontLine[0].setCard(blocker);

  const handBefore = attackerPlayer.board.hand.length;
  const deckBefore = attackerPlayer.board.deck.length;

  AttackAction.execute(game, 0, 0);

  expect(attackerPlayer.board.hand.length).toBe(handBefore);
  expect(attackerPlayer.board.deck.length).toBe(deckBefore);

  expect(defenderPlayer.board.frontLine[0].isEmpty()).toBe(true);
  expect(defenderPlayer.board.trash).toContain(blocker);
});
});