import { DaCard, DaCardType } from './card.js'
import {DaActions} from './actioncard.js'
import { DaHeroCard } from './herocard.js'
import {DaDeck} from  './deck.js'
import {DaPlayerTypes, DaPlayer} from './player.js'

export class DaNpc extends DaPlayer {
					
	get type():DaPlayerTypes{
		return DaPlayerTypes.Npc;
	}

	constructor(name: string, deck:DaDeck) {
		super(name, deck); 
		super._isNPC = true;
	}

	DoARound(allPlayers) {		
		console.log('NPC doing a round');
		if (this.hero == undefined){
			//look through the hand				
			//set hero if there is any
			let hero = this.hand.find((c) => { return c.type == DaCardType.Hero;});			
			if (hero){
				super.SetHero(hero);
			}
		}
		
		if (this.hero){
			//equip item if there is any
			let items = this.hand.filter((c) => {return c.type == DaCardType.Item && c.heroType == this.hero.heroType;});
			items.forEach((i)=>{
				this.EquipHero(i);
			});			
		}
		
		let opponent = allPlayers.find((p) => {return !p.isNPC;}),	
			atomicBomb = this.hand.find((c) => {
				return c.type == DaCardType.Action && c.action == DaActions.AtomicBomb;
			});
		
		if (opponent.hero && opponent.hero.totalPoint > 0 && atomicBomb){
			this.PlayAnAction(atomicBomb);
		}else{		
			//draw from deck
			super.DrawFromDeck();
		}
	}
	
	ReactOnAction(card, args){
		let stopCard = this.hand.find((c) => {return c.action == DaActions.Stop;});
		
		if (stopCard){
			super.PlayAnAction(stopCard);			
			return true;
		}
		return false;
	}	
}