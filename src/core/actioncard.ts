import { DaCard, DaCardType } from "./card.js";

export enum DaActions {
	AtomicBomb,
	Stop,
	Radar,
	Steal,
	Super,
	PerfectCube,
	Swap,
	Provoke,
	Attack
}

export class DaActionCard extends DaCard {


	static callbacks = [];

	// private _callback = undefined;
	// get callback() {
	// 	return this._callback;
	// }
	// set callback(value) {
	// 	this._callback = value;
	// }
	
	private _action:DaActions;

	constructor(id:number, name:string, action:DaActions) {
		super(id, name, DaCardType.Action);
		this._action = action;
	}


	Play(player, args) {
		let callback = DaActionCard.callbacks[this._action];
		if (callback == undefined){
			throw new Error('Card action callback is not defined!!!');						
		}
		
		callback.call(null, player, args);
	}
}