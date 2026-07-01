import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";
import { advanceToAttackPhase } from "./helpers/gamePhaseHelper";

import { AttackAction } from "../gameEngine/actions/AttackAction";
import { Effect } from "../gameEngine/effects/Effect";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";

describe("grantEffect", () => {
  it("条件を満たす場合、付与されたOnBattleWin効果で1枚引く", () => {
    const game = createTestGame();

    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const effects: Effect[] = [
      {
        id: "grant-battle-win-draw",
        trigger: EffectTrigger.DuringOwnTurn,
        conditions: [
          {
            type: "hasCharacterNamesOnField",
            names: ["花海 咲季", "藤田 ことね"],
            mode: "all",
          },
        ],
        actions: [
          {
            type: "grantEffect",
            target: "self",
            effect: {
              id: "battle-win-draw",
              trigger: EffectTrigger.OnBattleWin,
              conditions: [
                {
                  type: "attackerIsSelf",
                },
              ],
              actions: [
                {
                  type: "draw",
                  count: 1,
                },
              ],
            },
          },
        ],
      },
    ];

    const temari = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 5000,
      effects,
    });

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 3000,
    });

    const kotone = TestCardFactory.createCharacter({
      name: "藤田 ことね",
      bp: 3000,
    });

    const blocker = TestCardFactory.createCharacter({
      name: "ブロッカー",
      bp: 3000,
    });

    player.board.frontLine[0].setCard(temari);
    player.board.frontLine[1].setCard(saki);
    player.board.energyLine[0].setCard(kotone);

    opponent.board.frontLine[0].setCard(blocker);

    const handBefore = player.board.hand.length;
    const deckBefore = player.board.deck.length;

    AttackAction.execute(game, 0, 0);

    expect(player.board.hand.length).toBe(handBefore + 1);
    expect(player.board.deck.length).toBe(deckBefore - 1);

    expect(opponent.board.frontLine[0].isEmpty()).toBe(true);
    expect(opponent.board.trash).toContain(blocker);
  });

  it("条件を満たさない場合、付与されたOnBattleWin効果は得ない", () => {
    const game = createTestGame();

    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const effects: Effect[] = [
      {
        id: "grant-battle-win-draw",
        trigger: EffectTrigger.DuringOwnTurn,
        conditions: [
          {
            type: "hasCharacterNamesOnField",
            names: ["花海 咲季", "藤田 ことね"],
            mode: "all",
          },
        ],
        actions: [
          {
            type: "grantEffect",
            target: "self",
            effect: {
              id: "battle-win-draw",
              trigger: EffectTrigger.OnBattleWin,
              conditions: [
                {
                  type: "attackerIsSelf",
                },
              ],
              actions: [
                {
                  type: "draw",
                  count: 1,
                },
              ],
            },
          },
        ],
      },
    ];

    const temari = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 5000,
      effects,
    });

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 3000,
    });

    const blocker = TestCardFactory.createCharacter({
      name: "ブロッカー",
      bp: 3000,
    });

    player.board.frontLine[0].setCard(temari);
    player.board.frontLine[1].setCard(saki);
    // 藤田ことねを置かないので条件未達

    opponent.board.frontLine[0].setCard(blocker);

    const handBefore = player.board.hand.length;
    const deckBefore = player.board.deck.length;

    AttackAction.execute(game, 0, 0);

    expect(player.board.hand.length).toBe(handBefore);
    expect(player.board.deck.length).toBe(deckBefore);

    expect(opponent.board.frontLine[0].isEmpty()).toBe(true);
    expect(opponent.board.trash).toContain(blocker);
  });
  it("grantEffectで得た効果は、このキャラ自身が勝った時だけ発動する", () => {
  const game = createTestGame();
  const player = game.getCurrentPlayer();
  const opponent = game.getOpponentPlayer();

  advanceToAttackPhase(game);

  const grantEffect: Effect[] = [
    {
      id: "grant-battle-win-draw",
      trigger: EffectTrigger.DuringOwnTurn,
      conditions: [
        {
          type: "hasCharacterNamesOnField",
          names: ["花海 咲季", "藤田 ことね"],
          mode: "all",
        },
      ],
      actions: [
        {
          type: "grantEffect",
          target: "self",
          effect: {
            id: "battle-win-draw",
            trigger: EffectTrigger.OnBattleWin,
            conditions: [{ type: "attackerIsSelf" }],
            actions: [{ type: "draw", count: 1 }],
          },
        },
      ],
    },
  ];

  const temari = TestCardFactory.createCharacter({
    name: "月村 手毬",
    bp: 5000,
    effects: grantEffect,
  });

  const saki = TestCardFactory.createCharacter({ name: "花海 咲季", bp: 5000 });
  const kotone = TestCardFactory.createCharacter({ name: "藤田 ことね", bp: 3000 });
  const blocker = TestCardFactory.createCharacter({ name: "ブロッカー", bp: 3000 });

  player.board.frontLine[0].setCard(saki);
  player.board.frontLine[1].setCard(temari);
  player.board.energyLine[0].setCard(kotone);
  opponent.board.frontLine[0].setCard(blocker);

  const handBefore = player.board.hand.length;
  const deckBefore = player.board.deck.length;

  // 咲季が勝利。手毬自身は勝っていないので、手毬が得た効果は発動しない。
  AttackAction.execute(game, 0, 0);

  expect(player.board.hand.length).toBe(handBefore);
  expect(player.board.deck.length).toBe(deckBefore);
});
it("grantEffectの条件が外れると、付与効果は発動しない", () => {
  const game = createTestGame();
  const player = game.getCurrentPlayer();
  const opponent = game.getOpponentPlayer();

  advanceToAttackPhase(game);

  const effects: Effect[] = [
    {
      id: "grant-battle-win-draw",
      trigger: EffectTrigger.DuringOwnTurn,
      conditions: [
        {
          type: "hasCharacterNamesOnField",
          names: ["花海 咲季", "藤田 ことね"],
          mode: "all",
        },
      ],
      actions: [
        {
          type: "grantEffect",
          target: "self",
          effect: {
            id: "battle-win-draw",
            trigger: EffectTrigger.OnBattleWin,
            conditions: [{ type: "attackerIsSelf" }],
            actions: [{ type: "draw", count: 1 }],
          },
        },
      ],
    },
  ];

  const temari = TestCardFactory.createCharacter({
    name: "月村 手毬",
    bp: 5000,
    effects,
  });

  const saki = TestCardFactory.createCharacter({ name: "花海 咲季", bp: 3000 });
  const blocker = TestCardFactory.createCharacter({ name: "ブロッカー", bp: 3000 });

  player.board.frontLine[0].setCard(temari);
  player.board.frontLine[1].setCard(saki);
  // 藤田ことねがいないので条件未達

  opponent.board.frontLine[0].setCard(blocker);

  const handBefore = player.board.hand.length;
  const deckBefore = player.board.deck.length;

  AttackAction.execute(game, 0, 0);

  expect(player.board.hand.length).toBe(handBefore);
  expect(player.board.deck.length).toBe(deckBefore);
});
});