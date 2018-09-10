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
	
	private _nextPlayer: DaPlayer | undefined = undefined;
	get next():DaPlayer{
		return this._nextPlayer;
	}
	set next(value:DaPlayer){
		this._nextPlayer = value;
	}
	
	private _deck: DaDeck;
	
	private _callbacks = [];

	get type():DaPlayerTypes{
		return DaPlayerTypes.Player;
	}
	
	constructor(name: string, deck:DaDeck) {
		this._name = name;
		this._deck = deck;
	}
	
	private getCardsByType(type:DaCardTypes){
		let result = [];
		this.hand.forEach((c) =>{
			if (c.type == type){
				result.push(c);
			}
		})
		return result;
	}

	
	AddEventListener(event: DaPlayerEvents, callback){
		let callbacks = this._callbacks[event];
		if (callbacks == undefined){
			this._callbacks[event] = [callback];
		}else{
			this._callbacks[event].push(callback);
		}
	}

	HasCard(card: DaCard) {
		let found = undefined;
		this.hand.some((c, index) => {
			if (c === card) {
				found = index;
				return true;
			}
			return false;
		})
		return found;
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

		let index = this.HasCard(card);
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

		let index = this.HasCard(card)
		if (index == undefined) {
			throw new Error("Item Card not found!!!");
		}

		this.hand.splice(index, 1);
		this.hero.equip(card);
	}

	PlayAction(card: DaActionCard) {
		if (card.type != DaCardType.Action) {
			throw new Error("Card type is not ACTION!!!");
		}

		let index = this.HasCard(card);
		if (index == undefined) {
			throw new Error('Action Card not found!!!!!');
		}

		this.hand.splice(index, 1);
		card.Play(this);
		
		let callbacks = this._callbacks[DaPlayerEvents.PlayAction];
		if (callbacks){
			callbacks.forEach((c) =>{
				c.call(null, card);
			})
		}								
	}
	
	DoneAction(){
		let callbacks = this._callbacks[DaPlayerEvents.DoneAction];
		if (callbacks){
			callbacks.forEach((c) =>{
				c.call(null);
			})
		}		
	}
}


