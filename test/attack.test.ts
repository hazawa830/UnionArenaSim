import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { PlayCardAction} from "../gameEngine/actions/PlayCardAction";
import { AttackAction } from "../gameEngine/actions/AttackAction";
import { BoardLine } from "../gameEngine/enum/BoardLine";
import {advanceToMainPhase,advanceToAttackPhase} from "./helpers/gamePhaseHelper";
import { TestCardFactory } from "./helpers/TestCardFactory";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";
import { LogType } from "../gameEngine/enum/LogType";
import { ActionSource } from "../gameEngine/enum/ActionSource";

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
it("直接アタックするとAttackログとLifeDamageログが追加される", () => {
  const game = createTestGame();
  const player = game.getCurrentPlayer();
  const opponent = game.getOpponentPlayer();

  advanceToAttackPhase(game);

  const attacker = TestCardFactory.createCharacter({
    name: "攻撃キャラ",
    bp: 3000,
  });

  player.board.frontLine[0].setCard(attacker);

  const lifeBefore = opponent.board.lifeArea.length;

  AttackAction.execute(game, 0);

  expect(opponent.board.lifeArea.length).toBe(lifeBefore - 1);

  expect(game.logs.map((log) => log.type)).toContain(LogType.Attack);
  expect(game.logs.map((log) => log.type)).toContain(LogType.LifeDamage);

  const attackLog = game.logs.find((log) => log.type === LogType.Attack);
  expect(attackLog).toMatchObject({
    playerId: player.id,
    type: LogType.Attack,
  });
  expect(attackLog?.message).toContain("攻撃キャラ");

  expect(attackLog?.payload).toMatchObject({
    attackerInstanceId: attacker.instanceId,
    attackerCardId: attacker.card.id,
    attackerCardName: attacker.card.name,
    attackerIndex: 0,
    attackTarget: { type: "player" },
  });

  const damageLog = game.logs.find((log) => log.type === LogType.LifeDamage);
  expect(damageLog).toMatchObject({
    playerId: player.id,
    type: LogType.LifeDamage,
  });
  expect(damageLog?.payload).toMatchObject({
    damagedPlayerId: opponent.id,
    attackerPlayerId: player.id,
    damageIndex: 1,
    totalDamage: 1,
    remainingLife: lifeBefore - 1,
  });
});
it("ブロックありのバトルではAttack, Block, BattleWin, Destroyログが追加される", () => {
  const game = createTestGame();
  const player = game.getCurrentPlayer();
  const opponent = game.getOpponentPlayer();

  advanceToAttackPhase(game);

  const attacker = TestCardFactory.createCharacter({
    name: "攻撃キャラ",
    bp: 5000,
  });

  const blocker = TestCardFactory.createCharacter({
    name: "防御キャラ",
    bp: 3000,
  });

  player.board.frontLine[0].setCard(attacker);
  opponent.board.frontLine[0].setCard(blocker);

  AttackAction.execute(game, 0, 0);

  expect(opponent.board.trash).toContain(blocker);



  const blockLog = game.logs.find((log) => log.type === LogType.Block);
  expect(blockLog).toMatchObject({
    playerId: opponent.id,
    type: LogType.Block,
  });
  expect(blockLog?.payload).toMatchObject({
    blockerInstanceId: blocker.instanceId,
    blockerCardId: blocker.card.id,
    attackerInstanceId: attacker.instanceId,
    isRest: true,
    blockedThisTurnCount: 1,
  });

  const battleWinLog = game.logs.find((log) => log.type === LogType.BattleWin);
  expect(battleWinLog).toMatchObject({
    playerId: player.id,
    type: LogType.BattleWin,
  });
  expect(battleWinLog?.payload).toMatchObject({
    attackerInstanceId: attacker.instanceId,
    targetInstanceId: blocker.instanceId,
    attackerBp: 5000,
    targetBp: 3000,
    isBlock: true,
  });

  const destroyLog = game.logs.find((log) => log.type === LogType.Destroy);
  expect(destroyLog).toMatchObject({
    playerId: opponent.id,
    type: LogType.Destroy,
  });
  expect(destroyLog?.payload).toMatchObject({
    destroyedInstanceId: blocker.instanceId,
    destroyedCardId: blocker.card.id,
    byAttackerInstanceId: attacker.instanceId,
  });
});
it("狙い撃ちではAttackログにfrontLineCharacter targetが記録される", () => {
  const game = createTestGame();
  const player = game.getCurrentPlayer();
  const opponent = game.getOpponentPlayer();

  advanceToAttackPhase(game);

  const attacker = TestCardFactory.createCharacter({
    name: "狙い撃ちキャラ",
    bp: 5000,
    keywords: [{ type: "snipe" }],
  });

  const target = TestCardFactory.createCharacter({
    name: "対象キャラ",
    bp: 3000,
  });

  player.board.frontLine[0].setCard(attacker);
  opponent.board.frontLine[2].setCard(target);

  AttackAction.execute(
    game,
    0,
    undefined,
    ActionSource.PlayerNormal,
    {
      type: "frontLineCharacter",
      index: 2,
    }
  );

  const attackLog = game.logs.find((log) => log.type === LogType.Attack);

  expect(attackLog?.payload).toMatchObject({
    attackerInstanceId: attacker.instanceId,
    attackerCardId: attacker.card.id,
    attackTarget: {
      type: "frontLineCharacter",
      index: 2,
    },
  });

  expect(game.logs.map((log) => log.type)).toContain(LogType.BattleWin);
  expect(game.logs.map((log) => log.type)).toContain(LogType.Destroy);
});
});