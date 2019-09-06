export interface ICard_com_data {
  id: number,
  cardType: DaCardType,
  heroType?: DaHeroTypes,
  action?: DaActions,
  point: number
}


export enum DaCardType {
	Monster = 'm',
	Hero = 'h',
	Action = 'a',
	Item = 'i'
}

export enum DaHeroTypes {
	Knight = 'k',
	Wizard = 'w',
	Ranger = 'r'
}

export enum DaActions {
	AtomicBomb,
	Stop,
	Radar,
	Steal,
	// Super,
	// PerfectCube,
	Retreat,
	Provoke,
	Attack,	
	SuicideBelt,
	MindReading,
}

export enum damonster_events {
  DeckDraw = "com_draw-from-deck",
  PlayerSetHero = "com_set-hero",
  PlayerEquipHero = "com_equip-hero",
  PlayerDoAction = "com_do-action",
  PlayerSkipAction = "com_action-done",
  PlayerDoBattle = "com_do-battle"
}

export interface IDaMonster_Com {
  addEventListener(event: damonster_events, callback: any): void;
  initHand(npcCards: ICard_com_data[], playerCards: ICard_com_data[]): void;
  playerHeroSet(
    isNPC: boolean,
    hero?: { id: number; type: string; point: number }
  ): void;
  playerEquipHero(
    isNPC: boolean,
    card: ICard_com_data
  ): void;
  playerAddCardFromDeck(
    isNPC: boolean,
    card: ICard_com_data
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
    action: DaActions,
    cards: { id: number; isNPC: boolean }[],
    isStopped: boolean,
    ...args: any[]
  ): void;
  delayForNSec(sec?: number): void;
}
