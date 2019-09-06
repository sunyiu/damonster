import { DaCard, DaCardType } from './card'
import { DaActionCard, DaActions } from './actioncard'
import { DaHeroCard, DaItemCard } from './herocard'
import { DaDeck } from  './deck'
import { DaPlayerTypes, DaPlayer } from './player'

export class DaNpc extends DaPlayer {
	
	get type(): DaPlayerTypes {
		return DaPlayerTypes.Npc;
	}

	constructor(name: string, deck: DaDeck) {
		super(name, deck, true);
	}

	DoARound(allPlayers : DaPlayer[], availableMonsters: DaCard[]) {
		let opponent = allPlayers.find((p) => { return !p.isNPC; }),
			actions = this.hand.filter((c) => {return c.type == DaCardType.Action;}) as DaActionCard[],
			heros = this.hand.filter((c) => {return c.type == DaCardType.Hero}) as DaHeroCard[],
			items = this.hand.filter((c) => {return c.type == DaCardType.Item}) as DaItemCard[];

			if (!opponent){
				throw "NO PLAYER !!!!!";
			}			
			
			
			
			
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
				if (actions[DaActions.Retreat] && this.hero) {
					this.PlayAnAction(actions[DaActions.Retreat].id);
					return;
				} else {
					this.PlayAnAction(atomicBomb.id);
					return;
				}
			}
		}
		
		let attack = actions.find((a) => {return a.action == DaActions.Attack;});		
		if (attack 
				&& this.hero 
				&& opponent.hero 
				&& (this.hero && opponent.hero && this.hero.totalPoint > opponent.hero.totalPoint)
			){
			this.PlayAnAction(attack.id);
			return;
		}


		let provoke = actions.find((a) => {return a.action == DaActions.Provoke;});
		if (provoke && this.hero && availableMonsters && availableMonsters.length > 0) {
			//TODO:: provoke to kill opponent hero....
			let monster:{point: number, card:DaCard | undefined} = {
				point: 0,
				card: undefined
			};

			availableMonsters.forEach((m) => {
				if (!m.point){
					return;
				}

				if (m.point > monster.point) {
					monster.point = m.point;
					monster.card = m;
				}
			});
			if (this.hero.totalPoint > monster.point && monster.card) {
				this.PlayAnAction(provoke.id, monster.card.id);
				return;
			}
		}
		
		let steal = actions.find((a) => {return a.action == DaActions.Steal;});
		if (steal) {
			this.PlayAnAction(steal.id, 0);
			return;
		}


		//get max point equipped hero overall
		//active hero (potential max point)
		let maxHero, maxHeroPotentialPoint = 0;
		if (this.hero){
			maxHero = this.hero;
			
			let equipped = items.filter((i) => {return i.heroType == this.hero!.heroType;}) as DaItemCard[];
			if (equipped.length > 0){
				maxHeroPotentialPoint = equipped.reduce((total, i) => {return total + i.point}, this.hero.totalPoint);				
			}else{
				maxHeroPotentialPoint = this.hero.totalPoint;
			}			
		}
		
		//get max point equipped hero on hand
		heros.forEach((h) => {
			let equipped = items.filter((i) => {return i.heroType == h.heroType;}),
				maxPoint = (equipped.length > 0) 
					? equipped.reduce((total, i) => {return total + i.point}, h.totalPoint)
					: h.totalPoint;			
			
			if (maxHeroPotentialPoint < maxPoint){
				maxHero = h;
				maxHeroPotentialPoint = maxPoint;
			}
		})
		
		//retreat
		if (this.hero && maxHero && maxHero.id != this.hero.id){
			//play retreat... because the hand has a hero with more points					
			let retreat = actions.find((a) => {return a.action == DaActions.Retreat;});
			if (retreat) {
				this.PlayAnAction(retreat.id);
				return;
			}	
		}
		
		if (!this.hero && maxHero){
			super.SetHero(maxHero.id);
			return;
		}
						

		if (this.hero) {
			//equip item if there is any
			let item = items.find((c) => { return c.heroType == this.hero!.heroType; });
			if (item){
				this.EquipHero(item.id);
				return;
			}
		}
					
		//draw from deck
		super.DrawFromDeck();		
	}

	ReactOnAction(card: DaActionCard, ...args: any[]) {
		let stopCard = this.hand.find((c) => { return (c as DaActionCard).action == DaActions.Stop; });

		if (stopCard) {
			super.PlayAnAction(stopCard.id);
		} else {
			super.SkipAction();
		}
	}
}