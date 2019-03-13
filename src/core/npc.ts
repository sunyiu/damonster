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
		let opponent = allPlayers.find((p) => { return !p.isNPC; }),
			actions = this.hand.filter((c) => {return c.type == DaCardType.Action;}),
			heros = this.hand.filter((c) => {return c.type == DaCardType.Hero}),
			items = this.hand.filter((c) => {return c.type == DaCardType.Item});
			
// 			heros = [],
// 			items = [];
// 		this.hand.forEach((c) => {
// 			if (c.type == DaCardType.Action) {
// 				actions[c.action] = c;
// 			}
// 
// 			if (c.type == DaCardType.Hero) {
// 				heros[c.heroType] = {
// 					hero: c,
// 					point: c.point,
// 					items: []
// 				};
// 			}
// 		});
// 		this.hand.forEach((c) => {
// 			if (c.type == DaCardType.Item) {
// 				let hero = heros[c.heroType]
// 				if (hero) {
// 					hero.point += c.point;
// 					hero.items.push(c);
// 				}
// 			}
// 		});
// 
// 
// 		let maxHero = undefined;
// 		for (var key in heros) {
// 			if (!maxHero || maxHero.point < heros[key].point) {
// 				maxHero = heros[key];
// 			}
// 		}


		//action
		let atomicBomb = actions.find((a) => {return a.action == DaActions.AtomicBomb;});
		if (atomicBomb) {
			if (!this.hero && opponent.hero) {
				this.PlayAnAction(atomicBomb.id);
				return;
			}

			if (this.hero && opponent.hero && opponent.hero.totalPoint > this.hero.totalPoint) {
				if (actions[DaActions.Retreat] && (!maxHero || maxHero.point < this.hero.totalPoint)) {
					this.PlayAnAction(actions[DaActions.Retreat].id);
					return;
				} else {
					this.PlayAnAction(atomicBomb.id);
					return;
				}
			}
		}
		
		let attack = actions.find((a) => {return a.action == DaActions.Attack;});		
		if ((attack && this.hero && opponent.hero) && (
				(this.hero && opponent.hero && this.hero.totalPoint > opponent.hero.totalPoint) ||
				(this.hero.totalPoint < opponent.hero.totalPoint && maxHero && maxHero.point > opponent.hero.totalPoint)
			)){
			this.PlayAnAction(attack.id);
			return;
		}


		let retreat = actions.find((a) => {return a.action == DaActions.Retreat;});
		if (retreat && this.hero && maxHero && maxHero.point > this.hero.totalPoint) {
			this.PlayAnAction(retreat.id);
			return;
		}

		let provoke = actions.find((a) => {return a.action == DaActions.Provoke;});
		if (provoke && this.hero && availableMonsters && availableMonsters.length > 0) {
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
				this.PlayAnAction(provoke.id, monster.card.id);
				return;
			}
		}
		
		let steal = actions.find((a) => {return a.action == DaActions.Steal;});
		if (steal) {
			this.PlayAnAction(steal.id, 0);
			return;
		}



		if (this.hero == undefined && heros.length > 0) {
			//look through the hand				
			//set hero with max point if there is any
			
			let maxPoint = 0, heroId = null;			
			heros.forEach((h) =>{
				let equiped = this.items.find((i) => {i.heroType == h.heroType;}),
					totalPoint = equiped.reduce((total, i) => {
						return total + i.point					
					}, h.point);
				if (totalPoint > maxPoint){
					maxPoint = totalPoint;
					heroId = h.id;
				}
			})
			
			if (heroId){
				super.SetHero(hero.id);
				return;
			}												
		}

		if (this.hero) {
			//equip item if there is any
			let item = this.items.find((c) => { return c.heroType == this.hero.heroType; });
			if (item){
				this.EquipHero(item.id);
				return;
			}
		}
					
		//draw from deck
		super.DrawFromDeck();		
	}

	ReactOnAction(card, args) {
		let stopCard = this.hand.find((c) => { return c.action == DaActions.Stop; });

		if (stopCard) {
			super.PlayAnAction(stopCard.id);
		} else {
			super.SkipAction();
		}
	}
}