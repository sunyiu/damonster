import {DaCard, DaCardType} from './card.js'
import {DaHeroCard} from './herocard.js'

export class DaPlayer{
	
	public hand:DaCard[] = [];
	public hero:DaHeroCard | undefined = undefined;
	public monsterKilled:DaMonster[] = [];
			
	private _name:string;
	get name():string{
		return this._name;
	}
							
	constructor(name:string){
		this._name = name;
	}
	
	Take(card:DaCard){
		this.hand.push(card);		
	}
	
	HasCard(card:DaCard){
		let found = undefined;
		this.hand.some((c, index)=>{
			if (c === card){
				found = index;
				return true;
			}
			return false;
		})
		return found;
	}
	
	New(){
		//this.hand.splice(0);
		this.hand = [];
		this.hero = undefined;
	}						
	
}