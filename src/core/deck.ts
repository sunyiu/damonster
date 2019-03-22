import { DaCard, DaCardType } from './card.js'
import { DaHeroCard, DaHeroTypes, DaItemCard } from "./herocard.js"
import { DaActions, DaActionCard } from "./actioncard.js"

export function GetDefaultCards(): { monster: DaCard[]; hero: DaHeroCard[]; item: DaCard[]; skill: DaActionCard[] } {
	return {
		monster: [
			new DaCard(1, "m1", DaCardType.Monster, 1),
			new DaCard(2, "m2", DaCardType.Monster, 1),
			new DaCard(3, "m3", DaCardType.Monster, 1),
			new DaCard(4, "m4", DaCardType.Monster, 2),
			new DaCard(5, "m5", DaCardType.Monster, 2),
			new DaCard(6, "m6", DaCardType.Monster, 3),
			new DaCard(7, "m7", DaCardType.Monster, 3)
		],
		hero: [
			new DaHeroCard(8, "k1", 1, DaHeroTypes.Knight),
			new DaHeroCard(9, "k2", 1, DaHeroTypes.Knight),
			new DaHeroCard(10, "k3", 1, DaHeroTypes.Knight),
			new DaHeroCard(11, "k4", 1, DaHeroTypes.Knight),
			new DaHeroCard(12, "w5", 1, DaHeroTypes.Wizard),
			new DaHeroCard(13, "w6", 1, DaHeroTypes.Wizard),
			new DaHeroCard(14, "w7", 1, DaHeroTypes.Wizard),
			new DaHeroCard(15, "w8", 1, DaHeroTypes.Wizard),
			new DaHeroCard(16, "r9", 1, DaHeroTypes.Ranger),
			new DaHeroCard(17, "r10", 1, DaHeroTypes.Ranger),
			new DaHeroCard(18, "r11", 1, DaHeroTypes.Ranger),
			new DaHeroCard(19, "r12", 1, DaHeroTypes.Ranger),
		],
		item: [
			new DaItemCard(20, "ki1", 1, DaHeroTypes.Knight),
			new DaItemCard(21, "ki2", 1, DaHeroTypes.Knight),
			new DaItemCard(22, "ki3", 1, DaHeroTypes.Knight),
			new DaItemCard(23, "ki4", 1, DaHeroTypes.Knight),
			new DaItemCard(24, "wi6", 1, DaHeroTypes.Wizard),
			new DaItemCard(25, "wi7", 1, DaHeroTypes.Wizard),
			new DaItemCard(26, "wi8", 1, DaHeroTypes.Wizard),
			new DaItemCard(27, "wi9", 1, DaHeroTypes.Wizard),
			new DaItemCard(28, "ri11", 1, DaHeroTypes.Ranger),
			new DaItemCard(29, "ri12", 1, DaHeroTypes.Ranger),
			new DaItemCard(30, "ri13", 1, DaHeroTypes.Ranger),
			new DaItemCard(31, "ri14", 1, DaHeroTypes.Ranger),

		],

		skill: [
			// new DaActionCard(32, 'Suicide Belt', DaActions.SuicideBelt),
			// new DaActionCard(33, 'Suicide Belt', DaActions.SuicideBelt),
			// new DaActionCard(34, 'Suicide Belt', DaActions.SuicideBelt),

			new DaActionCard(32, 'Atomic Bomb', DaActions.AtomicBomb),
			new DaActionCard(33, 'Atomic Bomb', DaActions.AtomicBomb),
			new DaActionCard(34, 'Atomic Bomb', DaActions.AtomicBomb),

			// new DaActionCard(35, 'Mind Reading', DaActions.MindReading),
			// new DaActionCard(36, 'Mind Reading', DaActions.MindReading),
			// new DaActionCard(37, 'Mind Reading', DaActions.MindReading),

			new DaActionCard(35, 'Stop', DaActions.Stop),
			new DaActionCard(36, 'Stop', DaActions.Stop),
			new DaActionCard(37, 'Stop', DaActions.Stop),

			new DaActionCard(38, 'Radar', DaActions.Radar),
			new DaActionCard(39, 'Radar', DaActions.Radar),
			new DaActionCard(40, 'Radar', DaActions.Radar),

			new DaActionCard(41, 'Steal', DaActions.Steal),
			new DaActionCard(42, 'Steal', DaActions.Steal),
			new DaActionCard(43, 'Steal', DaActions.Steal),

			new DaActionCard(44, 'Retreat', DaActions.Retreat),
			new DaActionCard(45, 'Retreat', DaActions.Retreat),
			new DaActionCard(46, 'Retreat', DaActions.Retreat),			

			new DaActionCard(47, 'Provoke', DaActions.Provoke),
			new DaActionCard(48, 'Provoke', DaActions.Provoke),
			new DaActionCard(49, 'Provoke', DaActions.Provoke),

			new DaActionCard(50, 'Attack', DaActions.Attack),
			new DaActionCard(51, 'Attack', DaActions.Attack),
			new DaActionCard(52, 'Attack', DaActions.Attack),

		]
	};
}

/**
 * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
//Note however, that Retreatping variables with destructuring assignment causes significant performance loss, as of October 2017.
function shuffle(a: any) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export enum DaDeckEvents {
	MonsterFound = 'm',
	EndOfDeck = 'e'
}

export class DaDeck {

	public cards: DaCard[] = [];

	private _callbacks = [];

	constructor() {

	}

	AddEventListener(event: DaDeckEvents, callback) {
		let callbacks = this._callbacks[event];
		if (callbacks == undefined) {
			this._callbacks[event] = [callback];
		} else {
			this._callbacks[event].push(callback);
		}
	}

	Empty() {
		this.cards.splice(0);
	}

	AddCardsAndShuffle(cards: DaCard[]) {
		this.cards = shuffle(this.cards.concat(cards));
	}

	Deal(): DaCard {
		if (this.cards.length == 0) {
			throw new Error("No card left in the deck!!!!");
		}

		let card = this.cards.pop();

		if (card.type == DaCardType.Monster) {
			let callbacks = this._callbacks[DaDeckEvents.MonsterFound];
			if (callbacks) {
				callbacks.forEach((c) => {
					c.call(null, card);
				})
			}
		}

		if (this.cards.length == 0) {
			let callbacks = this._callbacks[DaDeckEvents.EndOfDeck];
			if (callbacks) {
				callbacks.forEach((c) => {
					c.call(null);
				})
			}
		}

		return card;
	}
	
	NextNCards(count:number){
		let result = [],
			end = this.cards.length <= count ? 0 : this.cards.length - count;
		
		for(var i=this.cards.length-1; i>=end; i--){
			result.push(this.cards[i]);
		}
		return result;
	}


}
