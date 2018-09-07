import { DaCard, DaCardType } from "./card.js";

export enum DaActions{
	AtomicBomb = "Atomic Bomb",
	Stop = "Stop",
	SeeTheFuture = "See The Future",
	Steal = "Steal",
	Super = "Super",
	PerfectCube = "Perfect Cube"	
}

export class DaActionCard extends DaCard{
	
	
	private _callback = undefined;
	get callback(){
		return this._callback;
	}
	set callback(value){
		this._callback = value;
	}

	constructor(id, name){
		super(id, name, DaCardType.Action);				
	}
	
	
	Play(player){
		this.callback.call(null, player);		
	}
}