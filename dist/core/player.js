export class DaPlayer {
    constructor(name) {
        this.hand = [];
        this.hero = undefined;
        this._name = name;
    }
    get name() {
        return this._name;
    }
    Take(card) {
        this.hand.push(card);
    }
    New() {
        //this.hand.splice(0);
        this.hand = [];
        this.hero = undefined;
    }
}
