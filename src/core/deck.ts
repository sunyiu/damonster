import {DaCard, DaCardType, GetCards} from './card.js'

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

export class DaDeck {
	
	private _cards:DaCard[] = [];

	constructor() {

	}
	
	Empty(){
		this._cards = [];
	}
	
	AddCardsAndShuffle(cards:DaCard[]){
		this._cards = shuffle(this._cards.concat(cards));
	}
	
	Deal():DaCard{
		let card = this._cards.pop();
		if (card == undefined){
			throw new Error("End of the Deck reached...");
		}
		return card;
	}
		

}
