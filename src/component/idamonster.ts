export enum damonster_events {
  DeckDraw = "draw-from-deck",
  PlayerSetHero = "set-hero",
  PlayerEquipHero = "equip-hero",
  PlayerDoAction = "do-action",
  PlayerSkipAction = "action-done",
  PlayerDoBattle = "do-battle"
}

export interface IDaMonster_Com {
  addEventListener(event: damonster_events, callback: any): void;
  initHand(npcCards:[], playerCards:[]): void;
  playerHeroSet(
    isNPC: boolean,
    hero?: { id: number; type: string; point: number }
  ): void;
  playerEquipHero(
    isNPC: boolean,
    card: { id: number; point: number; cardType: string; heroType: string }
  ): void;
  playerAddCardFromDeck(
    isNPC: boolean,
    card: {
      id: number;
      point: number;
      cardType: string;
      heroType: string;
      action: string;
    }
  ): void;
  switchToPlayer(isNPC: boolean): void;
  monsterInvade(
    id: number,
    point: number,
    type: string,
    heroType: string,
    action: string
  ): void;
  battleDone(
    winner: "player" | "npc" | "monster",
    monsterId: number,
    monsterPoint: number,
    isActivePlayerNPC: boolean
  ): void;
  actionStart(isNPC: boolean, cardId: number): void;
  actionDone(
    cards: { id: number; isNPC: boolean }[],
    action: {
      id: number; //action id
      cardId: number; //action card id
      isStopped: boolean; //is action stopped
      isNPC: boolean; //is action played by NPC
      args?: {
        cardIds?: number[];
        card?: {
          id: number;
          point: number;
          type: string;
          heroType: string;
          action: string;
        };
        winner?: "player" | "npc" | "none";
      };
    }
  ): void;
  delayForNSec(sec?: number): void;
}
