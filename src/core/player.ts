import {DaCard, DaHeroCard, DaCardType} from './card.js'

export class DaPlayer{
			
	private _name:string;
	get name():string{
		return this._name;
	}
	
	public hand:DaCard[] = [];
	public hero:DaHeroCard | undefined = undefined;
					
	constructor(name:string){
		this._name = name;
	}
	
	Take(card:DaCard){
		this.hand.push(card);		
	}
	
	New(){
		//this.hand.splice(0);
		this.hand = [];
		this.hero = undefined;
	}
	
	
	
		
	
}