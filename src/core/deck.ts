import { DaCard, DaCardType } from './card.js'
import { DaHeroCard, DaHeroTypes, DaItemCard } from "./herocard.js"
import { DaActions, DaActionCard } from "./actioncard.js"

export function GetDefaultCards(): { monster: DaCard[]; hero: DaHeroCard[]; item: DaCard[]; skill: DaActionCard[] } {
	return {
		monster: [
			new DaCard(1, "m1", DaCardType.Monster, 4),
			new DaCard(2, "m2", DaCardType.Monster, 10),
			new DaCard(3, "m3", DaCardType.Monster, 25),
			new DaCard(4, "m4", DaCardType.Monster, 50),
			new DaCard(5, "m5", DaCardType.Monster, 100),
			new DaCard(6, "m6", DaCardType.Monster, 200),
			new DaCard(7, "m7", DaCardType.Monster, 500)
		],
		hero: [
			new DaHeroCard(8, "k1", 5, DaHeroTypes.Knight),
			new DaHeroCard(9, "k2", 5, DaHeroTypes.Knight),
			new DaHeroCard(10, "k3", 5, DaHeroTypes.Knight),
			new DaHeroCard(11, "w4", 5, DaHeroTypes.Wizard),
			new DaHeroCard(12, "w5", 5, DaHeroTypes.Wizard),
			new DaHeroCard(13, "w6", 5, DaHeroTypes.Wizard),
			new DaHeroCard(14, "r7", 5, DaHeroTypes.Ranger),
			new DaHeroCard(15, "r8", 5, DaHeroTypes.Ranger),
			new DaHeroCard(16, "r9", 5, DaHeroTypes.Ranger),
		],
		item: [
			new DaItemCard(17, "ki1", 5, DaHeroTypes.Knight),
			new DaItemCard(18, "ki2", 15, DaHeroTypes.Knight),
			new DaItemCard(19, "ki3", 25, DaHeroTypes.Knight),
			new DaItemCard(20, "ki4", 50, DaHeroTypes.Knight),
			new DaItemCard(21, "ki5", 100, DaHeroTypes.Knight),
			new DaItemCard(22, "wi6", 5, DaHeroTypes.Wizard),
			new DaItemCard(23, "wi7", 15, DaHeroTypes.Wizard),
			new DaItemCard(24, "wi8", 25, DaHeroTypes.Wizard),
			new DaItemCard(25, "wi9", 50, DaHeroTypes.Wizard),
			new DaItemCard(26, "wi10", 100, DaHeroTypes.Wizard),
			new DaItemCard(27, "ri11", 5, DaHeroTypes.Ranger),
			new DaItemCard(28, "ri12", 15, DaHeroTypes.Ranger),
			new DaItemCard(29, "ri13", 25, DaHeroTypes.Ranger),
			new DaItemCard(30, "ri14", 50, DaHeroTypes.Ranger),
			new DaItemCard(31, "ri15", 100, DaHeroTypes.Ranger),

		],

		skill: [
			new DaActionCard(32, 'Super', DaActions.Super),
			new DaActionCard(33, 'Super', DaActions.Super),
			new DaActionCard(34, 'Super', DaActions.Super),

			new DaActionCard(35, 'Perfect Cube', DaActions.PerfectCube),
			new DaActionCard(36, 'Perfect Cube', DaActions.PerfectCube),
			new DaActionCard(37, 'Perfect Cube', DaActions.PerfectCube),

			new DaActionCard(38, 'Stop', DaActions.Stop),
			new DaActionCard(39, 'Stop', DaActions.Stop),
			new DaActionCard(40, 'Stop', DaActions.Stop),

			new DaActionCard(41, 'Atomic Bomb', DaActions.AtomicBomb),
			new DaActionCard(42, 'Atomic Bomb', DaActions.AtomicBomb),

			new DaActionCard(43, 'Radar', DaActions.Radar),
			new DaActionCard(44, 'Radar', DaActions.Radar),

			new DaActionCard(45, 'Steal', DaActions.Steal),
			new DaActionCard(46, 'Steal', DaActions.Steal),

			new DaActionCard(47, 'Swap', DaActions.Swap),
			new DaActionCard(48, 'Swap', DaActions.Swap),

			new DaActionCard(49, 'Provoke', DaActions.Provoke),
			new DaActionCard(50, 'Provoke', DaActions.Provoke),

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
//Note however, that swapping variables with destructuring assignment causes significant performance loss, as of October 2017.
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


}
