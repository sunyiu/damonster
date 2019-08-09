import { DaDeck, DaDeckEvents, GetDefaultCards } from "./deck"
import { DaPlayer, DaPlayerTypes, DaPlayerEvents } from "./player"
import { DaCardType } from "./card"
import { DaHeroCard } from "./herocard"
import {DaCard} from './card'
import { DaActions, DaActionCard } from  "./actioncard"
import { DaNpc } from "./npc"


export enum DaMonsterGameEvents {
	MonsterInvade,
	BattleDone,
	DoneDrawFromDeck,
	SetHero,
	EquipHero,
	ActionStart,
	ActionDone,	
}


export class DaMonsterGame {		
	public monsterCard: DaCard | undefined = undefined;
	public availableMonsters: DaCard[] = [];
	public playedActions: {
			player: DaPlayer,
			card: DaActionCard,
			args?: [],
			isStopped: boolean,
			result: any
		}[] = [];		
		
	private _deck: DaDeck = new DaDeck();
	get deck() {
		return this._deck;
	}
		
	private _players: DaPlayer[] = [];
	get players() {
		return this._players;
	}
	get player(): DaPlayer{
		let player = this._players.find((p) => p.type == DaPlayerTypes.Player);
		if (!player){
			throw "NO PLAYER FOUND";
		}
		return player;
	}
	get npc(): DaPlayer{
		let player = this._players.find((p) => p.type == DaPlayerTypes.Npc);
		if (!player){
			throw "NO PLAYER FOUND";
		}
		return player;
	}	
	
	get activePlayer():DaPlayer{
		let aplayer = this._players.find((p) => {return p.isActive;});
		if (!aplayer){
			throw "Active player is not set!!!!";
		}
		return aplayer;
	}
	
	private _isProvokeBattle:boolean = false;	
	
	private _callbacks:((target:any, ...args:any[])=>void)[][] = [];
	AddEventListener(event: DaMonsterGameEvents, callback: (target:any, ...args:any[])=>void) {
		let callbacks = this._callbacks[event];
		if (callbacks == undefined) {
			this._callbacks[event] = [callback];
		} else {
			this._callbacks[event].push(callback);
		}
	}

	private initDeck() {		
		this._deck.AddEventListener(DaDeckEvents.MonsterFound, (monster) =>{
			//Monster INvade
			//console.log('%s draw from deck.... and MONSTER %o invade', p.name, monster);
			console.log('MONSTER %o invade', monster);
			this._isProvokeBattle = false;
			this.monsterCard = monster;
			
			let callbacks = this._callbacks[DaMonsterGameEvents.MonsterInvade];
			if (callbacks) {
				callbacks.forEach((c) => {
					c.call(null, monster);
				})
			}																
		});
	}

	private initPlayers() {
		let p1 = new DaPlayer("p1", this._deck),
			p2 = new DaNpc("npc", this._deck);
			
		p1.nextPlayer = p2;
		p2.nextPlayer = p1;

		this._players.push(p1, p2);
		// this._player = p1;
		// this._npc = p2;
		
		this._players.forEach((p, index) => {
						
			// p.AddEventListener(DaPlayerEvents.MonsterInvade,(monster) => {
			// 	console.log('%s draw from deck.... and MONSTER %o invade', p.name, monster);
			// 	this._isProvokeBattle = false;
			// 	this.monsterCard = monster;									
			// });
									
			p.AddEventListener(DaPlayerEvents.DoneDrawFromDeck,(card) => {
				//component to display the card taken																												
				let callbacks = this._callbacks[DaMonsterGameEvents.DoneDrawFromDeck];
				if (callbacks) {
					callbacks.forEach((c) => {
						c.call(null, p, card);
					})
				}
				
				if (this.activePlayer.isNPC){
					(this.activePlayer as DaNpc).DoARound(this._players, this.availableMonsters);					
				}				
			});
			
			p.AddEventListener(DaPlayerEvents.SetHero,(hero) => {
				let callbacks = this._callbacks[DaMonsterGameEvents.SetHero];
				if (callbacks) {
					callbacks.forEach((c) => {
						c.call(null, p, hero);
					})
				}
				
				if (p.isNPC){
					(p as DaNpc).DoARound(this._players, this.availableMonsters);
				}
			});

			p.AddEventListener(DaPlayerEvents.EquipHero,(card) => {
				let callbacks = this._callbacks[DaMonsterGameEvents.EquipHero];
				if (callbacks) {
					callbacks.forEach((c) => {
						c.call(null, p, card);
					})
				}
								
				if (p.isNPC){
					(p as DaNpc).DoARound(this._players, this.availableMonsters);
				}				
			});

									
			
			p.AddEventListener(DaPlayerEvents.StartAction,(card, args) => {
				console.log('%s play an action %s with args %o', p.name, card.name, args);

				// if (this.playedActions.length > 0 && (card.action != DaActions.Stop || card.action != DaActions.Retreat)) {
				// 	throw new Error("Cannot play another action when there is a pending action (only stop and retreat can)!!!!");
				// }
				
				if (this.playedActions.length == 0 && card.action == DaActions.Stop){
					throw new Error("No pending action to stop!!!!");
				}
				
				this.playedActions.push({
					player: p,
					card: card,
					args: args,
					isStopped: false,
					result: undefined
				});				
				
				// if (card.action == DaActions.Stop){
				// 	
				// }else{
				// 	this.playedActions[0].isStopped = !this.playedActions[0].isStopped;
				// 	this.playedActions.push({
				// 		player: p,
				// 		card: card
				// 	});
				// }
								
				this._players.forEach((player) =>{
					if (player !== p){
						player.isActionDone = false;
						if (player.isNPC){
							(player as DaNpc).ReactOnAction(card, args);
						}
					}else{
						player.isActionDone = true;
					}
				})
				
				let callbacks = this._callbacks[DaMonsterGameEvents.ActionStart];
				if (callbacks) {
					callbacks.forEach((c) => {
						c.call(null, p, card);
					})
				}																
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

	private initActionCards():void {
		DaActionCard.callbacks[ DaActions.AtomicBomb] = (player: DaPlayer) => {
			console.log("Action card (Atomic bomb) played");
			let hasMonster = this.monsterCard != undefined;								
			//monster
			if (this.monsterCard) {
				player.monsterKilled.push(this.monsterCard);
				this.monsterCard = undefined;
			}						
			//heros
			this._players.forEach((p) => {
				p.hero = undefined;
			});
			
			return hasMonster;
		}

		DaActionCard.callbacks[DaActions.Provoke] = (player: DaPlayer, args?: any[]) => {
			if (!args || args.length < 1){
				throw "Arg is needed for Action Provoke!!!";
			}
			console.log('Provoke a monster %o', args[0]);
			let id = args[0],
				index = this.availableMonsters.findIndex((c) => { return c.id == id; });

			if (index < 0) {
				throw new Error("Monster card is not found from the available monster");
			}
				
			let monsterCard = this.availableMonsters[index];
			if (monsterCard.type != DaCardType.Monster) {
				throw new Error("Card type is not monster in provoke");
			}
					
			//provoke monster!!!
			this._isProvokeBattle = true;
			this.availableMonsters.splice(index, 1);									
			this.monsterCard = monsterCard;
			return this.monsterCard;
		}

		//DaActions.Stop:						
		//Stopping logic is handled in DaMonsterGame player play action callback event??					

		DaActionCard.callbacks[DaActions.Radar] = (player:DaPlayer) => {
			console.log('Radar.... %s', player);
			return this._deck.NextNCards(3);
		}


		DaActionCard.callbacks[DaActions.Steal] = (player, args) => {
			if (!args || args.length < 1){
				throw "Arg is needed for Action Steal!!!";
			}

			console.log('Steal..... %s', player);
			let cardIndex = args[0];
			if (isNaN(cardIndex)) {
				throw new Error('NO CARD to steal.. (card index is empty)!!!!');
			}
			let target = player.isNPC 
				? this.players.find((p) => {p.type == DaPlayerTypes.Player})
				: this.players.find((p) => {p.type == DaPlayerTypes.Npc});
			if (!target){
				throw "Target not found in action STEAL!!!!"
			}
			
			let card = target.hand[cardIndex];
			target.hand.splice(cardIndex, 1);							 
			player.hand.push(card);
			return card;
		}

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

		DaActionCard.callbacks[DaActions.Retreat] = (player, args) => {
			console.log("Retreat......");
			if (!player.hero){
				//retreat nothing....
				return;
			}
			player.hero.items.forEach((i) => {
				player.hand.push(i);
			})
			player.hand.push(player.hero);
			
			player.hero = undefined;
		}

		DaActionCard.callbacks[DaActions.Attack] = (player, args) => {
			console.log('Attack action by %s', player);

			if (!this.players[0].hero || !this.players[1].hero){
				return [];
			}

			if (this.players[0].hero.totalPoint == this.players[1].hero.totalPoint){
				this.players[0].hero = undefined;
				this.players[1].hero = undefined;
				return [this.players[0], this.players[1]];
			}
			
			if (this.players[0].hero.totalPoint < this.players[1].hero.totalPoint){
				this.players[0].hero = undefined;
				return [this.players[0]];
			}else{
				this.players[1].hero = undefined;
				return [this.players[1]];
			}						 
		}
					
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
	
		
	Battle() {
		console.log('BATTLE');
		if (!this.monsterCard){
			throw new Error("No monster to BATTLE!!!");
		}

		let maxPointPlayer: DaPlayer | undefined,
			winner: DaPlayer | undefined | DaCard,
			isPlayerWin = false;
		this._players.forEach((p: DaPlayer) => {
			//if equal point, active player win.....
			if (p.hero){
				if (!maxPointPlayer || 
					(maxPointPlayer.hero!.totalPoint < p.hero.totalPoint) ||
					(maxPointPlayer.hero!.totalPoint == p.hero.totalPoint && p.isActive)){
					maxPointPlayer = p;
				}					
			}
		});

		if (!maxPointPlayer || this.monsterCard.point! > maxPointPlayer.hero!.totalPoint) {
			//monster win
			console.log('monster win!!!!');
			this.availableMonsters.push(this.monsterCard);
			this._players.forEach((p: DaPlayer) => {
				p.hero = undefined;
			});
			winner = this.monsterCard;
		} else {
			console.log('player win!!!!!');
			//check for each player
			winner = maxPointPlayer;
			isPlayerWin = true;
			maxPointPlayer.monsterKilled.push(this.monsterCard);
		}
				
		let callbacks = this._callbacks[DaMonsterGameEvents.BattleDone];
		if (callbacks) {
			callbacks.forEach((c) => {
				c.call(null, null, [isPlayerWin, winner, this.activePlayer]);
			})
		}

		this.monsterCard = undefined;		
		if (this.activePlayer.isNPC){
			(this.activePlayer as DaNpc).DoARound(this._players, this.availableMonsters);
		}
	}

	New() {
		let cards = GetDefaultCards();
		this._deck.Empty();
		
		let cloneCards: any[] = [];
		this._deck.AddCardsAndShuffle(cloneCards.concat(cards.hero, cards.item, cards.skill));

		this._players.forEach((p, index) => {
			p.New();
			//there wont be any monster card at this point of time...
			for (var i = 5; i > 0; i--) {
				p.hand.push(this._deck.Deal());								
			}
		})
		this._deck.AddCardsAndShuffle(cards.monster);
		
		this._players.find((p) => {return !p.isNPC;})!.isActive = true;		
	}

	ExeCardAction() {
		
		let cards = this.playedActions.map((a) => {return {cardId: a.card.id, player: a.player};}),
			nonStopActions = [];
			
		for (var i = 0; i < this.playedActions.length; i++){
			if (this.playedActions[i].card.action != DaActions.Stop){
				nonStopActions.push(this.playedActions[i]);				
			}else{
				let currentAction = nonStopActions[nonStopActions.length - 1];
				currentAction.isStopped = !currentAction.isStopped;				
			}						 			
		}
		
		nonStopActions.forEach((action) =>{
			if (!action.isStopped){
				//do action
				action.result = action.card.Play(action.player, action.args);
			}
			let callbacks = this._callbacks[DaMonsterGameEvents.ActionDone];
			if (callbacks) {
				callbacks.forEach((c) => {
					c.call(null, action, cards);
				})
			}																															
		})
									
		this.playedActions = [];
																						
		//check for monster card...
		// //can be monster invade -> atomic bomb (next player)
		// //or action -> provoke....			
		if (!this.monsterCard){
			if (this.activePlayer.isNPC){
				(this.activePlayer as DaNpc).DoARound(this._players, this.availableMonsters);
			}
		}else{
			//battle mode....
			let monsterCallback = this._callbacks[DaMonsterGameEvents.MonsterInvade];
			if (monsterCallback) {
				monsterCallback.forEach((c) => {
					c.call(null, this.monsterCard);
				})
			}																
		}																
		
	}
	
}
