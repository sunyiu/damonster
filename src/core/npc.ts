import { DaCard, DaCardType } from './card.js'
import { DaActions } from './actioncard.js'
import { DaHeroCard } from './herocard.js'
import { DaDeck } from  './deck.js'
import { DaPlayerTypes, DaPlayer } from './player.js'

export class DaNpc extends DaPlayer {

	get type(): DaPlayerTypes {
		return DaPlayerTypes.Npc;
	}

	constructor(name: string, deck: DaDeck) {
		super(name, deck);
		super._isNPC = true;
	}

	DoARound(allPlayers, availableMonsters) {
		console.log('NPC doing a round');

		let opponent = allPlayers.find((p) => { return !p.isNPC; }),
			actions = [],
			heros = [],
			items = [];
		this.hand.forEach((c) => {
			if (c.type == DaCardType.Action) {
				actions[c.action] = c;
			}

			if (c.type == DaCardType.Hero) {
				heros[c.heroType] = {
					hero: c,
					point: c.point,
					items: []
				};
			}
		});
		this.hand.forEach((c) => {
			if (c.type == DaCardType.Item) {
				let hero = heros[c.heroType]
				if (hero) {
					hero.point += c.point;
					hero.items.push(c);
				}
			}
		});


		let maxHero = undefined;
		for (var key in heros) {
			if (!maxHero || maxHero.point < heros[key].point) {
				maxHero = heros[key];
			}
		}


		if (actions[DaActions.AtomicBomb]) {
			if (!this.hero && opponent.hero) {
				this.PlayAnAction(actions[DaActions.AtomicBomb]);
				return;
			}

			if (this.hero && opponent.hero && opponent.hero.totalPoint > this.hero.totalPoint) {
				if (actions[DaActions.Retreat] && (!maxHero || maxHero.point < this.hero.totalPoint)) {
					this.PlayAnAction(actions[DaActions.Retreat]);
					return;
				} else {
					this.PlayAnAction(actions[DaActions.AtomicBomb]);
					return;
				}
			}
		}
		
		if ((actions[DaActions.Attack] && this.hero && opponent.hero) && (
				(this.hero && opponent.hero && this.hero.totalPoint > opponent.hero.totalPoint) ||
				(this.hero.totalPoint < opponent.hero.totalPoint && maxHero && maxHero.point > opponent.hero.totalPoint)
			)){
			this.PlayAnAction(actions[DaActions.Attack]);
			
		}


		if (actions[DaActions.Retreat] && this.hero && maxHero && maxHero.point > this.hero.totalPoint) {
			this.PlayAnAction(actions[DaActions.Retreat]);
			return;
		}

		if (actions[DaActions.Provoke] && this.hero && availableMonsters && availableMonsters.length > 0) {
			//TODO:: provoke to kill opponent hero....
			let monster = {
				point: undefined,
				card: undefined
			};
			availableMonsters.forEach((m) => {
				if (!monster.point || monster.point > m.point) {
					monster.point = m.point;
					monster.card = m;
				}
			});
			if (this.hero.totalPoint > availableMonsters.point) {
				this.PlayAnAction(actions[DaActions.Provoke], monster.card.id);
				return;
			}
		}

		if (actions[DaActions.Steal]) {
			this.PlayAnAction(actions[DaActions.Steal]);
			return;
		}



		if (this.hero == undefined) {
			//look through the hand				
			//set hero if there is any
			let hero = this.hand.find((c) => { return c.type == DaCardType.Hero; });
			if (hero) {
				super.SetHero(hero);
			}
		}

		if (this.hero) {
			//equip item if there is any
			let items = this.hand.filter((c) => { return c.type == DaCardType.Item && c.heroType == this.hero.heroType; });
			items.forEach((i) => {
				this.EquipHero(i);
			});
		}
					
		
		//draw from deck
		super.DrawFromDeck();
	}

	ReactOnAction(card, args) {
		let stopCard = this.hand.find((c) => { return c.action == DaActions.Stop; });

		if (stopCard) {
			super.PlayAnAction(stopCard);
		} else {
			super.SkipAction();
		}
	}
}