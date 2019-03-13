
export enum DaCardType {
	Monster = 'm',
	Hero = 'h',
	Action = 'a',
	Item = 'i'
}


export class DaCard {

	private _id: number;
	get id() {
		return this._id;
	}

	private _name: string;
	get name() {
		return this._name;
	}

	private _type: DaCardType;
	get type() {
		return this._type;
	}
	
	get isMonster(){
		return this._type == DaCardType.Monster;
	}

	private _point: number | undefined;
	get point() {
		return this._point;
	}

	constructor(id: number, name: string, type: DaCardType, point?: number | undefined) {
		this._id = id;
		this._name = name;
		this._type = type;
		this._point = point;
	}


	tostring(): string {
		let point = this._point ? " {p:" + this._point + "}" : "";
		return this.type + ' CARD ' + "_" + this.id + ":" + this.name + point;
	}
}


