import { damonster_events, IDaMonster_Com, ICard_com_data } from "./component/idamonster";
import { DaMonsterGame, DaMonsterGameEvents, IPlayedAction } from "./core/game";
import { DaCard, DaCardType } from "./core/card";
import { DaHeroCard, DaHeroTypes } from "./core/herocard";
import { DaActionCard, DaActions } from "./core/actioncard";

const DaCard2ComData = (card: DaCard): ICard_com_data => {
  let data: ICard_com_data = { id: card.id, point: card.point, cardType: card.type };
  switch (card.type) {
    case DaCardType.Hero:
    case DaCardType.Item:
      data.heroType = (card as DaHeroCard).heroType;
      break;

    case DaCardType.Action:
      data.action = (card as DaActionCard).action;
      break;
  }
  return data;
}

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
      component.switchToPlayer(!player.isNPC);
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
  game.AddEventListener(DaMonsterGameEvents.ActionDone, (action: IPlayedAction, isStopped: boolean, cards: { id: number, isNPC: boolean }[]) => {
    let args: any[] = [];
    ;
    switch (action.card.action) {
      case DaActions.Radar:
        args = action.result.map(
            (c: any): number => {
              return c.id;
            }
          );
        break;

      case DaActions.Steal:
        args = [
          {
            isNPC: action.player.isNPC,   //from
            cardId: action.result.id
          }
        ];
        break;
      case DaActions.AtomicBomb:
        //args = {
        //   //monster card
        //   card: {
        //     id: action.result.id as number,
        //     point: action.result.point as number,
        //     cardType: action.result.cardType as DaCardType,
        //     heroType: action.result.heroType as DaHeroTypes,
        //     action: action.result.action as DaActions
        //   }
        // };
        break;

      case DaActions.Attack:
        // args = {
        //   winner: action.result
        //     ? action.result.isNPC
        //       ? "npc"
        //       : "player"
        //     : ("none" as "none" | "npc" | "player")
        // };
        break;
    }

    component.actionDone(
      action.card.action,
      cards,
      isStopped,
      ...args);
  });

  //-----------------------------------------------------------------------
  component.addEventListener(damonster_events.DeckDraw, (e: any) => {
    game.player.DrawFromDeck();
  });

  component.initHand(
    game.npc.hand.map((c) => {
      return DaCard2ComData(c);
    }),
    game.player.hand.map((c) => {
      return DaCard2ComData(c);
    })
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
