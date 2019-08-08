import { DaCard, DaCardType } from "./card";

export enum DaHeroTypes {
	Knight = 'k',
	Wizard = 'w',
	Ranger = 'r'
}

export class DaHeroCard extends DaCard {

	public items: DaCard[] = [];
	
	private _attack?:number;
	get attack():number | undefined{
		return this._attack;
	}
	set attack(value:number | undefined){
		this._attack = value;
	}
	
	private _defense?:number;
	get defense():number | undefined{
		return this._defense;
	}
	set defense(value:number | undefined){
		this._defense = value;
	}

	get totalPoint(): number {
		let itemPoints: number = 0;
		this.items.forEach((i) => {
			if (i.point){
				itemPoints += i.point;
			}
		})
		return this.point ? this.point + itemPoints : itemPoints;
	}

	private _heroType: DaHeroTypes;
	public get heroType(): DaHeroTypes {
		return this._heroType;
	}

	constructor(id: number, name: string, point: number, heroType: DaHeroTypes) {
		super(id, name, DaCardType.Hero, point);		
		this._heroType = heroType;
	}

	equip(card: DaItemCard) {
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
