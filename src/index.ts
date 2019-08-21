import { damonster_events, IDaMonster_Com } from "./component/idamonster";
import { DaMonsterGame, DaMonsterGameEvents } from "./core/game";
import { DaActions } from "./core/actioncard";

export function start(component: IDaMonster_Com) {
  let game = new DaMonsterGame();
  game.init();
  game.New();

  game.AddEventListener(
    DaMonsterGameEvents.DoneDrawFromDeck,
    (player, card) => {
      component.playerAddCardFromDeck(player.isNPC, {
        id: card.id,
        point: card.point,
        cardType: card.type,
        heroType: card.heroType,
        action: card.action
      });
      component.switchToPlayer(player.isNPC);
    }
  );
  game.AddEventListener(DaMonsterGameEvents.SetHero, (player, hero) => {
    if (hero) {
      component.playerHeroSet(player.isNPC, {
        id: hero.id,
        type: hero.type,
        point: hero.point
      });
    } else {
      component.playerHeroSet(player.isNPC);
    }
    component.delayForNSec();
  });
  game.AddEventListener(DaMonsterGameEvents.EquipHero, (player, item) => {
    component.playerEquipHero(player.isNPC, {
      id: item.id,
      point: item.point,
      cardType: item.type,
      heroType: item.heroType
    });
    component.delayForNSec();
  });
  game.AddEventListener(DaMonsterGameEvents.MonsterInvade, monster => {
    //TODO:: npc can play an action (e.g. atomic or retreat...)
    component.monsterInvade(
      monster.id,
      monster.point,
      monster.type,
      monster.heroType,
      monster.action
    );
  });
  game.AddEventListener(
    DaMonsterGameEvents.BattleDone,
    (isPlayerWin, winner, activePlayer) => {
      let temp: "npc" | "player" | "monster" = isPlayerWin
        ? winner.isNPC
          ? "npc"
          : "player"
        : "monster";
      component.battleDone(temp, winner.id, winner.point, activePlayer.isNPC);
    }
  );
  game.AddEventListener(DaMonsterGameEvents.ActionStart, (player, card) => {
    component.actionStart(player.isNPC, card.id);
  });
  game.AddEventListener(DaMonsterGameEvents.ActionDone, (action, cards) => {
    let c = cards.map((c: any) => {
        return {
          id: c.cardId,
          isNPC: c.player.isNPC
        };
      }),
      args:
        | {
            cardIds?: number[];
            card?: {
              id: number;
              point: number;
              type: string;
              heroType: string;
              action: string;
            };
            winner?: "none" | "player" | "npc";
          }
        | undefined;

    // AtomicBomb - 0
    // Stop - 1
    // Radar - 2
    // Steal - 3
    // Retreat - 4
    // Provoke -5
    // Attack - 6
    // SuicideBelt - 7
    // MindReading - 8
    switch (action.card.action) {
      case 2:
        args = {
          cardIds: action.result.map(
            (c: any): number => {
              return c.id;
            }
          )
        };
        break;

      case 3:
        args = {
          card: {
            id: action.result.id,
            point: action.result.point,
            type: action.result.type,
            heroType: action.result.heroType,
            action: action.result.action
          }
        };
        break;
      case 0:
        args = {
          //monster card
          card: {
            id: action.result.id,
            point: action.result.point,
            type: action.result.cardType,
            heroType: action.result.heroType,
            action: action.result.action
          }
        };
        break;

      case 6:
        args = {
          winner: action.result
            ? action.result.isNPC
              ? "npc"
              : "player"
            : ("none" as "none" | "npc" | "player")
        };
        break;
    }

    component.actionDone(c, {
      id: action.card.action,
      cardId: action.card.id,
      isStopped: action.isStopped,
      isNPC: action.player.isNPC,
      args: args
    });
  });

  //TODO:: take all event to root level
  //-- deck ------------------------------------------
  component.addEventListener(damonster_events.DeckDraw, (e: any) => {
    game.player.DrawFromDeck();
  });

  component.initHand(
    game.npc.hand.map((c: any) => {
      return {
        id: c.id,
        point: c.point,
        type: c.type,
        heroType: c.heroType,
        action: c.action,
        flip: false
      };
    }) as [],
    game.player.hand.map((c: any) => {
      return {
        id: c.id,
        point: c.point,
        type: c.type,
        heroType: c.heroType,
        action: c.action,
        flip: true
      };
    }) as []
  );

  component.addEventListener(damonster_events.PlayerSetHero, (e: any) => {
    game.player.SetHero(e.detail.card.id);
  });
  component.addEventListener(damonster_events.PlayerEquipHero, (e: any) => {
    game.player.EquipHero(e.detail.card.id);
  });
  component.addEventListener(damonster_events.PlayerDoAction, (e: any) => {
    switch (e.detail.card.action) {
      case DaActions.Steal:
        game.player.PlayAnAction(e.detail.card.id, 0);
        break;
      default:
        game.player.PlayAnAction(e.detail.card.id);
        break;
    }
  });
  component.addEventListener(damonster_events.PlayerDoBattle, (e: any) => {
    game.Battle();
    // this.animation = this.animation.then(() =>{
    //     game.Battle();
    //     return Promise.resolve();
    // });
  });
  component.addEventListener(damonster_events.PlayerSkipAction, (e: any) => {
    game.player.SkipAction();
  });
}
