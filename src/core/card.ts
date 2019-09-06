export enum DaCardType {
	Monster = 'm',
	Hero = 'h',
	Action = 'a',
	Item = 'i'
}

export class DaCard {

	private _id: number;
	get id():number {
		return this._id;
	}

	private _name: string;
	get name():string {
		return this._name;
	}

	private _type: DaCardType;
	get type():DaCardType {
		return this._type;
	}
	
	get isMonster():boolean{
		return this._type == DaCardType.Monster;
	}

	private _point: number = 0;
	get point(): number {
		return this._point;
	}

	constructor(id: number, name: string, type: DaCardType, point?: number) {
		this._id = id;
		this._name = name;
		this._type = type;
		if (point){
			this._point = point;
		}
	}


	tostring(): string {
		let point = this._point ? " {p:" + this._point + "}" : "";
		return this.type + ' CARD ' + "_" + this.id + ":" + this.name + point;
	}
}


