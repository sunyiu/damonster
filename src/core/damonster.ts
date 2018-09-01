import { DaDeck } from "./deck.js";
import { DaPlayer } from "./player.js";
import { GetCards, DaCardType, DaHeroCard } from "./card.js";

	
export default class DaMonster {

	private _deck: DaDeck;
	private _players: DaPlayer[] = [];
	get players(){
		return this._players;
	}


	constructor() {
		this._deck = new DaDeck();

		this._players.push(new DaPlayer("p1"));
		this._players.push(new DaPlayer("p2"));
	}

	New() {
		let cards = GetCards();
				
		this._deck.Empty();
		this._deck.AddCardsAndShuffle(cards.hero);
		
		this._players.forEach((p, index) => {
			p.New();
			for(var i=5; i>0; i--){
				p.Take(this._deck.Deal());				
			}						
		})

		this._deck.AddCardsAndShuffle(cards.monster);
	}

	PlayerDrawFromDeck(player: DaPlayer) {
		let card = this._deck.Deal();

		// if (card.type == DaCardType.Monster) {
		// 	//start battle
		// 	return;
		// }
		player.Take(card);
	}
	
	PlayerSetHero(player: DaPlayer, hero: DaHeroCard | undefined){
		player.hero = hero;
	}

	GetPlayerByIndex(index: number): DaPlayer {
		return this._players[index];
	}

}
