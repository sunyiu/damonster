import { DaCard, DaCardType } from "./card.js";

export enum DaHeroTypes {
	Knight = 'k',
	Wizard = 'w',
	Ranger = 'r'
}

export class DaHeroCard extends DaCard {

	public items: DaCard[] = [];
	
	private _attack:number;
	get attack():number{
		return this._attack;
	}
	set attack(value:number){
		this._attack = value;
	}
	
	private _defense:number;
	get defense():number{
		return this._defense;
	}
	set defense(value:number){
		this._defense = value;
	}

	get totalPoint(): number {
		let itemPoints: number = 0;
		this.items.forEach((i) => {
			itemPoints += i.point;
		})
		return this.point + itemPoints;
	}

	private _heroType: DaHeroTypes;
	public get heroType(): DaHeroTypes {
		return this._heroType;
	}

	constructor(id: number, name: string, point: number, heroType: DaHeroTypes) {
		super(id, name, DaCardType.Hero, point);		
		this._heroType = heroType;
	}

	equip(card: DaCard) {
		if (card.type != DaCardType.Item) {
			throw new Error("Cannot equip non Item card!!!");
		}
		if (card.heroType != this._heroType){
			throw new Error("Cannot equip different type item");
		}
		
		this.items.push(card);
	}
}



export class DaItemCard extends DaCard{
	
	private _heroType: DaHeroTypes;
	public get heroType(): DaHeroTypes{
		return this._heroType;
	}

	constructor(id: number, name:string, point: number, heroType:DaHeroTypes){
		super(id, name, DaCardType.Item, point);		
		this._heroType = heroType;
	}	
}
