import {DaCard, DaCardType} from './card.js'
import {DaHeroCard} from "./herocard.js"
import {DaActions, DaActionCard} from "./actioncard.js"

export function GetDefaultCards(): { monster: DaCard[]; hero: DaHeroCard[]; item:DaCard[]; skill:DaActionCard[] } {
	return {
		monster: [
			new DaCard(1, "m1", DaCardType.Monster, 50),
			new DaCard(2, "m2", DaCardType.Monster, 50),
			new DaCard(3, "m3", DaCardType.Monster, 50),
			new DaCard(4, "m4", DaCardType.Monster, 50),
			new DaCard(5, "m5", DaCardType.Monster, 50),
			new DaCard(6, "m6", DaCardType.Monster, 50),
			new DaCard(7, "m7", DaCardType.Monster, 50)
		],
		hero: [
			new DaHeroCard(8, "h1", 5),
			new DaHeroCard(9, "h2", 5),
			new DaHeroCard(10, "h3", 5),
			new DaHeroCard(11, "h4", 5),
			new DaHeroCard(12, "h5", 5),
			new DaHeroCard(13, "h6", 5),
			new DaHeroCard(14, "h7", 5),
			new DaHeroCard(15, "h8", 5),
			new DaHeroCard(16, "h9", 5),
			new DaHeroCard(17, "h10", 5)
		],
		item:[
			new DaCard(18, "i1", DaCardType.Item, 25),
			new DaCard(19, "i2", DaCardType.Item, 25),
			new DaCard(20, "i3", DaCardType.Item, 25),
			new DaCard(21, "i4", DaCardType.Item, 25),
			new DaCard(22, "i5", DaCardType.Item, 25),
			new DaCard(23, "i6", DaCardType.Item, 25),
			new DaCard(24, "i7", DaCardType.Item, 25),
			new DaCard(25, "i8", DaCardType.Item, 25),
			new DaCard(26, "i9", DaCardType.Item, 25),
			new DaCard(27, "i10", DaCardType.Item, 25),
			new DaCard(28, "i11", DaCardType.Item, 25),
			new DaCard(29, "i12", DaCardType.Item, 25),
			new DaCard(30, "i13", DaCardType.Item, 25),
			new DaCard(31, "i14", DaCardType.Item, 25),
			new DaCard(32, "i15", DaCardType.Item, 25),
						
		],
		
		skill:[
			new DaActionCard(33, DaActions.AtomicBomb),
			new DaActionCard(34, DaActions.AtomicBomb),
			new DaActionCard(35, DaActions.AtomicBomb),
			new DaActionCard(36, DaActions.Stop),
			new DaActionCard(37, DaActions.Stop),
			new DaActionCard(38, DaActions.Stop),
			new DaActionCard(39, DaActions.SeeTheFuture),
			new DaActionCard(40, DaActions.SeeTheFuture),
			new DaActionCard(41, DaActions.SeeTheFuture),
			new DaActionCard(42, DaActions.Steal),
			new DaActionCard(43, DaActions.Steal),
			new DaActionCard(44, DaActions.Steal),
			new DaActionCard(45, DaActions.Super),
			new DaActionCard(46, DaActions.Super),
			new DaActionCard(47, DaActions.Super),
			new DaActionCard(48, DaActions.PerfectCube),
			new DaActionCard(49, DaActions.PerfectCube),
			new DaActionCard(50, DaActions.PerfectCube),
			new DaActionCard(51, DaActions.AtomicBomb),
			new DaActionCard(52, DaActions.AtomicBomb)
		]
	};
}

/**
 * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
 //Note however, that swapping variables with destructuring assignment causes significant performance loss, as of October 2017.
function shuffle(a:any) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export enum DaDeckEvents{
	MonsterFound = 'm',
	EndOfDeck = 'e' 
}

export class DaDeck {
	
	public cards:DaCard[] = [];
	
	private _callbacks = [];

	constructor() {

	}
	
	AddEventListener(event: DaDeckEvents, callback){
		let callbacks = this._callbacks[event];
		if (callbacks == undefined){
			this._callbacks[event] = [callback];
		}else{
			this._callbacks[event].push(callback);
		}
	}	
	
	Empty(){
		this.cards.splice(0);
	}
	
	AddCardsAndShuffle(cards:DaCard[]){
		this.cards = shuffle(this.cards.concat(cards));
	}
	
	Deal():DaCard{
		if (this.cards.length == 0){
			throw new Error("No card left in the deck!!!!");
		}
		
		let card = this.cards.pop();
		
		if (card.type == DaCardType.Monster){
			let callbacks = this._callbacks[DaDeckEvents.MonsterFound];
			if (callbacks){
				callbacks.forEach((c) =>{
					c.call(null, card);
				})
			}			
		}
		
		if (this.cards.length == 0){
			let callbacks = this._callbacks[DaDeckEvents.EndOfDeck];
			if (callbacks){
				callbacks.forEach((c) =>{
					c.call(null);
				})
			}						
		}
										
		return card;
	}
		

}
