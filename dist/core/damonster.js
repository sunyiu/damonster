import { DaDeck } from "./deck.js";
import { DaPlayer } from "./player.js";
import { GetCards } from "./card.js";
export default class DaMonster {
    constructor() {
        this._players = [];
        this._deck = new DaDeck();
        this._players.push(new DaPlayer("p1"));
        this._players.push(new DaPlayer("p2"));
    }
    get players() {
        return this._players;
    }
    New() {
        let cards = GetCards();
        this._deck.Empty();
        this._deck.AddCardsAndShuffle(cards.hero);
        this._players.forEach((p, index) => {
            p.New();
            for (var i = 5; i > 0; i--) {
                p.Take(this._deck.Deal());
            }
        });
        this._deck.AddCardsAndShuffle(cards.monster);
    }
    PlayerDrawFromDeck(player) {
        let card = this._deck.Deal();
        // if (card.type == DaCardType.Monster) {
        // 	//start battle
        // 	return;
        // }
        player.Take(card);
    }
    PlayerSetHero(player, hero) {
        player.hero = hero;
    }
    GetPlayerByIndex(index) {
        return this._players[index];
    }
}
