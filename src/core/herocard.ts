import { DaCard, DaCardType } from "./card.js";

export class DaHeroCard extends DaCard{
	
	public items: DaCard[] = [];
	
	get totalPoint():number{
		let itemPoints:number = 0;
		this.items.forEach((i) =>{
			itemPoints += i.point;			
		})
		return this.point + itemPoints;
	}
			
	constructor(id:number, name: string, point: number){
		super(id, name, DaCardType.Hero, point);
	}
	
	equip(card:DaCard){
		if (card.type != DaCardType.Item){
			throw new Error("Cannot equip non Item card!!!");
		}
		this.items.push(card);		
	}
}
