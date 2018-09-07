import { DaDeck, GetDefaultCards } from "./deck.js"
import { DaPlayer } from "./player.js"
import { DaCardType } from "./card.js"
import { DaHeroCard } from "./herocard.js"
import { DaActions, DaActionCard } from  "./actioncard.js"


export default class DaMonster {

	private _deck: DaDeck;
	private _monster: DaCard;
	private _players: DaPlayer[] = [];
	
	private _isBattle: boolean = false;
	
	get players() {
		return this._players;
	}


	constructor() {
		this._deck = new DaDeck();

		this._players.push(new DaPlayer("p1"));
		this._players.push(new DaPlayer("p2"));
	}

	getCards() {
		let cards = GetDefaultCards();

		cards.skill.forEach((c, index) => {

			switch (c.name) {
				case DaActions.AtomicBomb:
					//atomic bomb (kill all include monster)
					c.callback = (player) => {
						console.log("Action card (Atomic bomb) played");						
						//monster
						player.monsterKilled.push(this._monster);
						this._monster = undefined;						
						//heros
						this._players.forEach((p) => {
							p.hero = undefined;
						});
					}
					break;

				default:
					c.callback = () => {
						console.log("Action card %o played :: %o", c, this);
					}

					break;
			}

		});
		return cards;
	}


	New() {
		let cards = this.getCards();

		this._deck.Empty();
		this._deck.AddCardsAndShuffle([].concat(cards.hero, cards.item, cards.skill));

		this._players.forEach((p, index) => {
			p.New();
			for (var i = 5; i > 0; i--) {
				p.Take(this._deck.Deal());
			}
		})

		this._deck.AddCardsAndShuffle(cards.monster);
	}

	GetPlayerByIndex(index: number): DaPlayer {
		return this._players[index];
	}
	
	//Player actions
	PlayerDrawFromDeck(player: DaPlayer) {
		let card = this._deck.Deal();

		if (card.type == DaCardType.Monster) {			
			//wait for action cards
			this._monster = card;
			this._isBattle = true;
			console.log("MONSTER INVADE (%o)!!!!! Wait for action cards", card);
			return;
		}

		player.Take(card);
	}

	PlayerSetHero(player: DaPlayer, hero: DaHeroCard | undefined) {
		if (hero == undefined) {
			player.hero = undefined;
			return;
		}

		if (player.hero != undefined) {
			throw new Error('Cannot set hero if one already exist....');
		}

		let index = player.HasCard(hero);
		if (index == undefined) {
			throw new Error("Hero card not found!!!!");
		}

		player.hand.splice(index, 1);
		player.hero = hero;
	}

	PlayerEquipHero(player: DaPlayer, card: DaCard) {
		if (card.type != DaCardType.Item) {
			throw new Error("Card type is not ITEM");
		}

		if (player.hero == undefined) {
			throw new Error("No hero exits to equip");
		}

		let index = player.HasCard(card)
		if (index == undefined) {
			throw new Error("Item Card not found!!!");
		}

		player.hero.equip(card);
	}

	PlayerPlayAction(player: DaPlayer, action: DaActionCard) {
		if (action.type != DaCardType.Action) {
			throw new Error("Card type is not ACTION!!!");
		}

		let index = player.HasCard(action);
		if (index == undefined) {
			throw new Error('Action Card not found!!!!!');
		}

		player.hand.splice(index, 1);
		action.Play(player);
	}



	Battle() {
		if (!this._monster) {
			//monster already been killed even before the battle
			return;
		}

		let maxPointPlayer = null;
		this._players.forEach((p: DaPlayer) => {
			//TODO::how about equal point????
			if (p.hero && (!maxPointPlayer || maxPointPlayer.hero.totalPoint < p.hero.totalPoint)) {
				maxPointPlayer = p;
			}
		});

		if (!maxPointPlayer || this._monster.point > maxPointPlayer.hero.totalPoint) {
			//monster win
			console.log('monster win!!!!');
			this._players.forEach((p: DaPlayer) => {
				p.hero = undefined;
			});
		} else {
			console.log('player win!!!!!');
			maxPointPlayer.monsterKill.push(this._monster);
		}
		
		this._isBattle = false;
	}

}
