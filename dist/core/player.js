export class DaPlayer {
    constructor(name) {
        this.hand = [];
        this._name = name;
    }
    get name() {
        return this._name;
    }
    Take(card) {
        this.hand.push(card);
    }
    New() {
        this.hand = [];
        this.hero = undefined;
    }
}
