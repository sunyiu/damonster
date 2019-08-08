import { DaCard, DaCardType } from './card'
import { DaHeroCard, DaItemCard } from './herocard'
import { DaDeck } from  './deck'

export enum DaPlayerTypes {
	Player = 'player',
	Npc = 'npc'
}

export enum DaPlayerEvents {
	DrawFromDeck,
	DoneDrawFromDeck,
	StartAction,
	EndAnAction,
	
	SetHero,
	EquipHero			
}


export class DaPlayer {
	public hand: DaCard[] = [];
	public monsterKilled: DaCard[] = [];
	public hero?: DaHeroCard;
	public isActive:boolean = false;

	private _name: string;
	get name(): string {
		return this._name;
	}
	private _isNPC: boolean;
	get isNPC(): boolean {
		return this._isNPC;
	}

	private _isActionDone: boolean;
	get isActionDone():boolean {
		return this._isActionDone;
	}
	set isActionDone(value:boolean) {
		this._isActionDone = value;
	}
	
	private _nextPlayer?:DaPlayer;
	set nextPlayer(value:DaPlayer){
		this._nextPlayer = value;
	}

	private _deck: DaDeck;

	private _callbacks: ((target:any, ...args:any[])=>void)[][] = [];

	get type(): DaPlayerTypes {
		return DaPlayerTypes.Player;
	}

	constructor(name: string, deck: DaDeck, isNPC? :boolean) {
		this._name = name;
		this._deck = deck;
		this._isNPC = false;
		this._isActionDone = false;
		if (isNPC){
			this._isNPC = isNPC;
		}
	}

	AddEventListener(event: DaPlayerEvents, callback: (target:any, ...args:any[])=>void) {
		let callbacks = this._callbacks[event];
		if (callbacks == undefined) {
			this._callbacks[event] = [callback];
		} else {
			this._callbacks[event].push(callback);
		}
	}

	New() {
		//this.hand.splice(0);
		this.hand = [];
		this.hero = undefined;
	}

	DrawFromDeck() {
		console.log('%s draw from deck', this._isNPC ? 'NPC' : 'Player');
		
		this.isActive = false;
		this._nextPlayer!.isActive = true;
						
		let card = this._deck.Deal(),
			isMonster = card.type == DaCardType.Monster;

		//If monster, monster invade will be called at deck.deal...
		
		if (!isMonster) {
			this.hand.push(card);
	
			let callbacks = this._callbacks[DaPlayerEvents.DoneDrawFromDeck];
			if (callbacks){
				callbacks.forEach((c) =>{
					c.call(null, card);
				})
			}								
		}		
	}
	
	RemoveCardFromHandById(cardId: number):DaCard{
		console.log('%s remove card from hand %s', this._isNPC ? 'NPC' : 'Player', cardId);
				
		let index = this.hand.findIndex((c) => {return c.id == cardId;});
		if (index == -1){
			throw new Error ('Card (id=' + cardId + ') not find!!!');
		}
		
		return this.hand.splice(index, 1)[0];		
	}
	
	SetHero(id?: number) {		
		console.log('%s set hero %s', this._isNPC ? 'NPC' : 'Player', id);
				
		if (id === undefined){
			this.hero = undefined;
			return;
		}
		
		let index = this.hand.findIndex((c) => { return c.id == id && c.type == DaCardType.Hero});
		
		
		if (this.hero != undefined) {
			throw new Error('Cannot set hero if one already exist....');
		}

		if (index == undefined) {
			throw new Error("Hero card not found!!!!");
		}
		
		this.hero = this.hand[index] as DaHeroCard;
		this.hand.splice(index, 1);
						
		let callbacks = this._callbacks[DaPlayerEvents.SetHero];
		if (callbacks) {
			callbacks.forEach((c) => {
				c.call(null, this.hero);
			})
		}		
	}

	EquipHero(id: number) {
		console.log('%s equip hero %s', this._isNPC ? 'NPC' : 'Player', id);		
		
		if (this.hero == undefined) {
			throw new Error("No hero exits to equip");
		}

		let index = this.hand.findIndex((c) => { return c.id == id; });
		if (index == undefined) {
			throw new Error("Item Card not found!!!");
		}
		
		let card = this.hand[index];
		if (card.type != DaCardType.Item) {
			throw new Error("Card type is not ITEM");
		}

		this.hero.equip(card as DaItemCard);
		this.hand.splice(index, 1);
		
		let callbacks = this._callbacks[DaPlayerEvents.EquipHero];
		if (callbacks) {
			callbacks.forEach((c) => {
				c.call(null, card);
			})
		}		
	}

	PlayAnAction(cardId: number, ...args:any[]) {
		console.log('%s set hero %s (args::%o)', this._isNPC ? 'NPC' : 'Player', cardId, args);
				
		let card = this.hand.find((c) => { return c.id == cardId;});
		if (!card){
			throw new Error ("Action card not in hand!!!!");
		}
		
		if (card.type != DaCardType.Action) {
			throw new Error("Card type is not ACTION!!!");
		}
		
		// if (!this._readyBattle){
		// 	throw new Error("Cannot play an action card for the moment!!!!");
		// }

		let index = this.hand.findIndex((c) => { return c === card; });
		if (index == undefined) {
			throw new Error('Action Card not found!!!!!');
		}

		this.hand.splice(index, 1);
		
		// let removeHandCallbacks = this._callbacks[DaPlayerEvents.RemoveCardFromHand];
		// if (removeHandCallbacks) {
		// 	removeHandCallbacks.forEach((c) => {
		// 		c.call(null, card.id);
		// 	})
		// }		

		let startActionCallbacks = this._callbacks[DaPlayerEvents.StartAction];
		if (startActionCallbacks) {
			startActionCallbacks.forEach((c) => {
				c.call(null, card, args);
			})
		}
	}

	SkipAction() {
		console.log('%s skip action', this._isNPC ? 'NPC' : 'Player');
				
		this._isActionDone = true;

		let callbacks = this._callbacks[DaPlayerEvents.EndAnAction];
		if (callbacks) {
			callbacks.forEach((c) => {
				c.call(null, this);
			})
		}
	}

	tostring(): string {
		return this._name;
	}
}


