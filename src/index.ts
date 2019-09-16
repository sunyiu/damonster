import { damonster_events, IDaMonster_Com, ICard_com_data } from "./component/idamonster";
import { DaMonsterGame, DaMonsterGameEvents, IPlayedAction } from "./core/game";
import { DaCard, DaCardType } from "./core/card";
import { DaHeroCard, DaHeroTypes } from "./core/herocard";
import { DaActionCard, DaActions } from "./core/actioncard";
import { DaPlayer } from "./core/player";

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
    (player, card): Promise<void> => {
      return component.playerAddCardFromDeck(player.isNPC, {
        id: card.id,
        point: card.point,
        cardType: card.type,
        heroType: card.heroType,
        action: card.action
      }).then(() =>{
        return component.switchToPlayer(!player.isNPC)
      });
    }
  );
  game.AddEventListener(DaMonsterGameEvents.SetHero, (player, hero) => {
    let heroCard = hero as DaHeroCard;
    if (heroCard) {
      return component.playerHeroSet(player.isNPC, {id: hero.id, type: heroCard.heroType, point: hero.point});
    } 
    return component.playerHeroSet(player.isNPC);
  });
  game.AddEventListener(DaMonsterGameEvents.EquipHero, (player, item) => {
    return component.playerEquipHero(player.isNPC, {
      id: item.id,
      point: item.point,
      cardType: item.type,
      heroType: item.heroType
    });
  });
  game.AddEventListener(DaMonsterGameEvents.MonsterInvade, monster => {
    //TODO:: npc can play an action (e.g. atomic or retreat...)
    return component.monsterInvade(
      monster.id,
      monster.point,
      monster.type,
      monster.heroType,
      monster.action
    );
  });
  game.AddEventListener(DaMonsterGameEvents.BattleDone, (winner: DaPlayer | DaCard, activePlayer) => {
      let win: "npc" | "player" | "monster" = (winner as DaPlayer)
        ? (winner as DaPlayer).isNPC ? 'npc' : 'player'
        : 'monster';

        return component.battleDone(win, (winner as DaCard).id, (winner as DaCard).point).then(() => {
          return component.switchToPlayer(!activePlayer.isNPC);
      });
    }
  );
  game.AddEventListener(DaMonsterGameEvents.ActionStart, (player, card) => {
    return component.actionStart(player.isNPC, card.id);
  });
  game.AddEventListener(DaMonsterGameEvents.ActionDone, (action: IPlayedAction) => {
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
            cardId: action.result ? action.result.id : undefined
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
    let cards: DaActionCard[] = [];
    cards.push(action.card);
    cards = cards.concat(action.stopCards)
    return component.actionDone(
      action.card.action,
      cards.map(c => {return c.id;}),
      action.isStopped,
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
  component.addEventListener(damonster_events.Battle, (e: any) => {
    game.Battle();
  });
  component.addEventListener(damonster_events.PlayerSkipAction, (e: any) => {
    game.player.SkipAction();
  });
}
