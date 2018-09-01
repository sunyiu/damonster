import {DaCard, DaHeroCard, DaCardType} from './card.js'

export class DaPlayer{
			
	private _name:string;
	get name():string{
		return this._name;
	}
	
	public hand:DaCard[] = [];
	public hero:DaHeroCard | undefined;
					
	constructor(name:string){
		this._name = name;
	}
	
	Take(card:DaCard){
		this.hand.push(card);		
	}
	
	New(){
		this.hand = [];
		this.hero = undefined;
	}
	
	
	
		
	
}