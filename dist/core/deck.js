/**
 * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
//Note however, that swapping variables with destructuring assignment causes significant performance loss, as of October 2017.
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
export class DaDeck {
    constructor() {
        this._cards = [];
    }
    Empty() {
        this._cards = [];
    }
    AddCardsAndShuffle(cards) {
        this._cards = shuffle(this._cards.concat(cards));
    }
    Deal() {
        let card = this._cards.pop();
        if (card == undefined) {
            throw new Error("End of the Deck reached...");
        }
        return card;
    }
}
