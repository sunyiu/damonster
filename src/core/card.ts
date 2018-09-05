
export enum DaCardType {
	Monster = 'm',
	Hero = 'h',
	Skill = 's',
	Item = 'i'
}

export function GetCards(): { monster: DaCard[], hero: DaCard[] } {
	return {
		monster: [
			new DaCard("m1", DaCardType.Monster),
			new DaCard("m2", DaCardType.Monster),
			new DaCard("m3", DaCardType.Monster),
			new DaCard("m4", DaCardType.Monster),
			new DaCard("m5", DaCardType.Monster),
			new DaCard("m6", DaCardType.Monster),
			new DaCard("m7", DaCardType.Monster)
		],
		hero: [
			new DaCard("h1", DaCardType.Hero),
			new DaCard("h2", DaCardType.Hero),
			new DaCard("h3", DaCardType.Hero),
			new DaCard("h4", DaCardType.Hero),
			new DaCard("h5", DaCardType.Hero),
			new DaCard("h6", DaCardType.Hero),
			new DaCard("h7", DaCardType.Hero),
			new DaCard("h8", DaCardType.Hero),
			new DaCard("h9", DaCardType.Hero),
			new DaCard("h10", DaCardType.Hero)
		]
	};
}

export class DaCard {

	private _name: string;
	get name() {
		return this._name;
	}

	private _type: DaCardType;
	get type() {
		return this._type;
	}

	constructor(name: string, type: DaCardType) {
		this._name = name;
		this._type = type;
	}
	
	tostring():string{
		return `CARD:: "${this._name}"`;  
		
	}
}

export class DaHeroCard extends DaCard{
		
	constructor(name: string){
		super(name, DaCardType.Hero);
	}
}
