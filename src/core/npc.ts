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
		//look through the hand
		
		//set hero if there is any
				
		//equip item if there is any
		
		//draw from deck
		super.DrawFromDeck();
	}
	
	DoAction(){
		//check if action is needed....
	}
}