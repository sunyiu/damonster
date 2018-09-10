import { DaCard, DaCardType } from './card.js'
import { DaHeroCard } from './herocard.js'
import {DaDeck} from  './deck.js'
import {DaPlayerTypes, DaPlayer} from './player.js'

export class DaNpc extends DaPlayer {
	
	get type():DaPlayerTypes{
		return DaPlayerTypes.Npc;
	}

	constructor(name: string, deck:DaDeck) {
		super(name, deck); 
	}

	Play() {		
		if (this.hero == undefined){
			//look through the hand				
			//set hero if there is any
			let heros = this.getCardsByType(DaCardType.Hero);
			if (heros && heros.length > 0){
				this.hero = heros[0];
			}
		}
		
		if (this.hero){
			//equip item if there is any
			let items = this.getCardsByType(DaCardType.Item);
			if (items && items.length > 0){
				items.forEach((i)=>{
					this.EquipHero(i);
				});
			}			
		}
		
		//draw from deck
		super.DrawFromDeck();
	}
	
	ReactOnAction(card){
		console.log('npc do nothing on player action');
		//another player plays an action....
	}
	
	MonsterInvade(card){
		//check if action is needed....
		console.log('npc do nothing on monster invade');
				
		//if done... trigger an event in damonster....
		if (true){
			super.DoneAction();
		}
	}
}