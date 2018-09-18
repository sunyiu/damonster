import { DaCard, DaCardType } from './card.js'
import { DaHeroCard } from './herocard.js'
import {DaDeck} from  './deck.js'

export enum DaPlayerTypes {
	Player = 'player',
	Npc = 'npc'
}

export enum DaPlayerEvents{
	DoneDrawFromDeck = 'D',
	DoneAction = 'DA',
	PlayAction = 'A'
}

export class DaPlayer {

	public hand: DaCard[] = [];
	public hero: DaHeroCard | undefined = undefined;
	public monsterKilled: DaMonster[] = [];

	private _name: string;
	get name(): string {
		return this._name;
	}
	
	// private _canAction:boolean = false;
	// get canAction():boolean{
	// 	return this._canAction;
	// }
	// set canAction(value:boolean){
	// 	this._canAction = value;
	// }
		
	private _deck: DaDeck;
	
	private _callbacks = [];

	get type():DaPlayerTypes{
		return DaPlayerTypes.Player;
	}
	
	constructor(name: string, deck:DaDeck) {
		this._name = name;
		this._deck = deck;
	}	
	
	AddEventListener(event: DaPlayerEvents, callback){
		let callbacks = this._callbacks[event];
		if (callbacks == undefined){
			this._callbacks[event] = [callback];
		}else{
			this._callbacks[event].push(callback);
		}
	}

	New() {
		//this.hand.splice(0);
		this.hand = [];
		this.hero = undefined;
	}

	DrawFromDeck() {
		let card = this._deck.Deal();

		if (card.type == DaCardType.Monster) {
			return;			
		}

		this.hand.push(card);
		
		let callbacks = this._callbacks[DaPlayerEvents.DoneDrawFromDeck];
		if (callbacks){
			callbacks.forEach((c) =>{
				c.call(null);
			})
		}
	}
	
	SetHero(card: DaHeroCard | undefined) {
		if (card == undefined) {
			this.hero = undefined;
			return;
		}

		if (this.hero != undefined) {
			throw new Error('Cannot set hero if one already exist....');
		}

		let index = this.hand.findIndex((c) => {return c === card;});
		if (index == undefined) {
			throw new Error("Hero card not found!!!!");
		}

		this.hand.splice(index, 1);
		this.hero = card;
	}

	EquipHero(card: DaCard) {
		if (card.type != DaCardType.Item) {
			throw new Error("Card type is not ITEM");
		}

		if (this.hero == undefined) {
			throw new Error("No hero exits to equip");
		}

		let index = this.hand.findIndex((c) => {return c === card;});
		if (index == undefined) {
			throw new Error("Item Card not found!!!");
		}
		
		this.hero.equip(card);
		this.hand.splice(index, 1);		
	}

	PlayAction(card: DaActionCard, ...args) {
		if (card.type != DaCardType.Action) {
			throw new Error("Card type is not ACTION!!!");
		}
		
		// if (!this._canAction){
		// 	throw new Error("Cannot play an action card for the moment!!!!");
		// }

		let index = this.hand.findIndex((c) => {return c === card;});
		if (index == undefined) {
			throw new Error('Action Card not found!!!!!');
		}

		this.hand.splice(index, 1);
		//card.Play(this, args); <-- actual play card will be triggered in daMonster
		
		let callbacks = this._callbacks[DaPlayerEvents.PlayAction];
		if (callbacks){
			callbacks.forEach((c) =>{
				c.call(null, card, args);
			})
		}								
	}
	
	// DoneAction(){
	// 	let callbacks = this._callbacks[DaPlayerEvents.DoneAction];
	// 	if (callbacks){
	// 		callbacks.forEach((c) =>{
	// 			c.call(null);
	// 		})
	// 	}		
	// }
}


