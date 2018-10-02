import { DaDeck, DaDeckEvents, GetDefaultCards } from "./deck.js"
import { DaPlayer, DaPlayerTypes, DaPlayerEvents } from "./player.js"
import { DaCardType } from "./card.js"
import { DaHeroCard } from "./herocard.js"
import { DaActions, DaActionCard } from  "./actioncard.js"
import { DaNpc } from "./npc.js"


export default class DaMonster {

	
	public tableCard: DaCard | undefined = undefined;
	public availableMonsters: DaCard[] = [];
	public currentPlayer = undefined;
	public playedActions: DaCard[] = [];
		
		
	private _deck: DaDeck;
	private _players: DaPlayer[] = [];

	private _isProvokeBattle:boolean = false;

	get players() {
		return this._players;
	}


	constructor() {
		this.initDeck();
		this.initPlayers();
		this.initActionCards();
	}

	private initDeck() {
		this._deck = new DaDeck();
	}

	private initPlayers() {
		let p1 = new DaPlayer("p1", this._deck),
			p2 = new DaNpc("npc", this._deck);

		this._players.push(p1, p2);
		this._players.forEach((p, index) => {

			p.AddEventListener(DaPlayerEvents.DoneDrawFromDeck,(monster) => {
				console.log('%s done draw from deck', p.name);
													
				if (monster){
					console.log('MONSTER %o invade', monster);
					this._isProvokeBattle = false;
					this.tableCard = monster;									
				}else{							
					this.currentPlayer = this.getNextPlayer(this.currentPlayer);
				}
			});
			

			p.AddEventListener(DaPlayerEvents.PlayAnAction,(card, args) => {
				console.log('%s play an action %s with args %o', p.name, card.name, args);

				if (this.playedActions.length > 0 && card.action != DaActions.Stop) {
					throw new Error("Cannot play another action when there is a pending!!!!");
				}
				
				if (this.playedActions.length == 0 && card.action == DaActions.Stop){
					throw new Error("No pending action to stop!!!!");
				}
				
				if (card.action != DaActions.Stop){
					this.playedActions.push({
						player: p,
						card: card,
						args: args,
						isStopped: false
					});
				}else{
					this.playedActions[0].isStopped = !this.playedActions[0].isStopped;
					this.playedActions.push({
						player: p,
						card: card
					});
				}
								
				this._players.forEach((player) =>{
					if (player !== p){
						player.isActionDone = false;
					}
				})												
			});
						
			p.AddEventListener(DaPlayerEvents.EndAnAction, (player) =>{
				if (this._players.every((p) => {
					return p.isActionDone;
				})){
					this.ExeCardAction();
				}				
			});
		});
	}

	private initActionCards() {
		Object.keys(DaActions).filter(key => !isNaN(Number(key))).forEach((index) => {

			switch (parseInt(index)) {
				case DaActions.AtomicBomb:
					DaActionCard.callbacks[index] = (player) => {
						console.log("Action card (Atomic bomb) played");								
						//monster
						if (this.tableCard) {
							player.monsterKilled.push(this.tableCard);
							this.tableCard = undefined;
						}						
						//heros
						this._players.forEach((p) => {
							p.hero = undefined;
						});
					}
					break;

				case DaActions.Provoke:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log('Provoke a monster %o', args[0]);
						let id = args[0],
							index = this.availableMonsters.findIndex((c) => { return c.id == id; });

						if (index < 0) {
							throw new Error("Monster card is found from the discard pile");
						}
							
						let monsterCard = this.availableMonsters[index];
						if (monsterCard.type != DaCardType.Monster) {
							throw new Error("Card type is not monster in provoke");
						}
								
						//provoke monster!!!
						this._isProvokeBattle = true;
						this.availableMonsters.splice(index, 1);			
						
						this.tableCard = monsterCard;
					}
					break;

				case DaActions.Stop:
					//Stopping logic is handled in daMonster player play action callback event??	
					break;

				case DaActions.Radar:
					DaActionCard.callbacks[index] = (player) => {
						console.log('Radar.... %s', player);
						this.tableCard = this._deck.NextNCards(3);
					}
					break;

				case DaActions.Steal:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log('Steal..... %s', player);
						// let card = args[0];
						// if (!card) {
						// 	throw new Error('Card not found on steal!!!!');
						// }
						let target = player.isNPC 
							? this.players.find((p) => { return !p.isNPC;}) 
							: this.players.find((p) => { return p.isNPC;}),
							index = Math.floor(Math.random() * target.hand.length),
							card = target.hand[index];
						target.hand.splice(index, 1);							 
						player.hand.push(card);
					}
					break;

// 				case DaActions.Super:
// 					DaActionCard.callbacks[index] = (player) => {
// 						console.log('Suuuuuper... %o', player);
// 						player.attack = 10000;
// 					}
// 					break;
// 
// 				case DaActions.PerfectCube:
// 					DaActionCard.callbacks[index] = (player) => {
// 						console.log('Perfect cube.... %o', player);
// 						player.defense = 100000;
// 					}
// 					break;

				case DaActions.Retreat:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log("Retreat......");
						player.hero.items.forEach((i) => {
							player.hand.push(i);
						})
						player.hand.push(player.hero);
						
						player.hero = undefined;
					}
					break;

				case DaActions.Attack:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log('Attack action by %s', player);
						if (this.players[0].hero.totalPoint == this.players[1].hero.totalPoint){
							return;
						}
						
						if (this.players[0].hero.totalPoint < this.players[1].hero.totalPoint){
							this.players[0].hero = undefined;							
						}else{
							this.players[1].hero = undefined;							
						}
					}
					break;
					
				// case DaActions.SuicideBelt:
				// 	//destory a target
				// 	DaActionCard.callbacks[index] = (player, args) =>{
				// 		let target = args[0];
				// 		if (!target){
				// 			throw new Error("Target player is needed for suicide belt!!!!");
				// 		}						
				// 		console.log('Suicide belt by %s', player);
				// 	}
				// 	break;
				// 
				// case DaActions.MindReading:
				// 	DaActionCard.callbacks[index] = (player, args) =>{
				// 		let target = args[0];
				// 		if (!target){
				// 			throw new Error("Target player is needed for mind reading!!!!");
				// 		}
				// 		if (typeof target != 'DaPlayer'){
				// 			throw new Error("Card type is not player in mind reading")
				// 		}
				// 		console.log('Mind reading to %s by %s', target, player);
				// 	}
				// 	break;
			}
		})
	}
	
	private getNextPlayer(player){
		let index = this._players.findIndex((p) => {
			return p === player;
		});
		if (index < 0){
			throw new Error ("Player not found!!!");
		}
		
		index = (index >= this._players.length - 1) ? 0 : index+1;
		return this._players[index];					
	}
	
	
	Battle() {
		console.log('BATTLE');
		if (!this.tableCard){
			throw new Error("No monster to BATTLE!!!");
		}

		let maxPointPlayer = null;
		this._players.forEach((p: DaPlayer) => {
			//TODO::how about equal point????
			if (p.hero && (!maxPointPlayer || maxPointPlayer.hero.totalPoint + maxPointPlayer.hero.attack < p.hero.totalPoint + p.hero.attack)) {
				maxPointPlayer = p;
			}
		});

		if (!maxPointPlayer || this.tableCard.point > maxPointPlayer.hero.totalPoint) {
			//monster win
			console.log('monster win!!!!');
			this.availableMonsters.push(this.tableCard);
			this._players.forEach((p: DaPlayer) => {
				p.hero = undefined;
			});
		} else {
			console.log('player win!!!!!');
			//check for each player
			this._players.forEach((p, index) => {
				if (p.hero && p.hero.totalPoint + p.hero.defense < this.tableCard.point) {
					p.hero = undefined;
				}
			});

			maxPointPlayer.monsterKilled.push(this.tableCard);
		}
		
		if (!this._isProvokeBattle){
			this.currentPlayer = this.getNextPlayer(this.currentPlayer);
		}
		
		//reset 
		this.tableCard = undefined;		
	}

	New() {
		let cards = GetDefaultCards();
		this._deck.Empty();
		this._deck.AddCardsAndShuffle([].concat(cards.hero, cards.item, cards.skill));

		this._players.forEach((p, index) => {
			p.New();
			//there wont be any monster card at this point of time...
			for (var i = 5; i > 0; i--) {
				p.hand.push(this._deck.Deal());								
			}
		})
		this._deck.AddCardsAndShuffle(cards.monster);
		
		this.currentPlayer = this._players[0];
	}

	ExeCardAction() {
		if (this.playedActions.length > 0) {
			let action = this.playedActions[0];
			if (!action.isStopped){
				//do action
				let result = action.card.Play(action.player, action.args);
			}
						
			this.playedActions = [];										
		}
	}


}
