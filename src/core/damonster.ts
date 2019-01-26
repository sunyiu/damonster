import { DaDeck, DaDeckEvents, GetDefaultCards } from "./deck.js"
import { DaPlayer, DaPlayerTypes, DaPlayerEvents } from "./player.js"
import { DaCardType } from "./card.js"
import { DaHeroCard } from "./herocard.js"
import { DaActions, DaActionCard } from  "./actioncard.js"
import { DaNpc } from "./npc.js"


export enum DaMonsterEvents {
	MonsterInvade,
	BattleDone,
	DrawFromDeck,
	SetHero,
	EquipHero,
	ActionStart,
	ActionExec,	
}


export default class DaMonster {
	

	
	public monsterCard: DaCard | undefined = undefined;
	public availableMonsters: DaCard[] = [];
	public playedActions: DaCard[] = [];		
		
	private _deck: DaDeck;
	get deck() {
		return this._deck;
	}
		
	private _players: DaPlayer[] = [];
	get players() {
		return this._players;
	}
	private _player: DaPlayer;
	get player(){
		return this._player;
	}
	private _npc: DaPlayer;
	get npc(){
		return this._npc;
	}
	
	private _isProvokeBattle:boolean = false;	

	constructor() {
		this.initDeck();
		this.initPlayers();
		this.initActionCards();
	}
	
	private _callbacks = [];
	AddEventListener(event: DaPlayerEvents, callback) {
		let callbacks = this._callbacks[event];
		if (callbacks == undefined) {
			this._callbacks[event] = [callback];
		} else {
			this._callbacks[event].push(callback);
		}
	}

	private initDeck() {
		this._deck = new DaDeck();
		
		this._deck.AddEventListener(DaDeckEvents.MonsterFound, (monster) =>{
			//Monster INvade
			//console.log('%s draw from deck.... and MONSTER %o invade', p.name, monster);
			console.log('MONSTER %o invade', monster);
			this._isProvokeBattle = false;
			this.monsterCard = monster;
			
			let callbacks = this._callbacks[DaMonsterEvents.MonsterInvade];
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

		this._players.push(p1, p2);
		this._player = p1;
		this._npc = p2;
		
		this._players.forEach((p, index) => {
						
			// p.AddEventListener(DaPlayerEvents.MonsterInvade,(monster) => {
			// 	console.log('%s draw from deck.... and MONSTER %o invade', p.name, monster);
			// 	this._isProvokeBattle = false;
			// 	this.monsterCard = monster;									
			// });
			p.AddEventListener(DaPlayerEvents.DoneDrawFromDeck,(card) => {				
				console.log('%s done draw from deck', p.name);
				let callbacks = this._callbacks[DaMonsterEvents.DrawFromDeck];
				if (callbacks) {
					callbacks.forEach((c) => {
						c.call(null, p, card);
					})
				}
				
				this.NextPlayer();				
			});
			
			p.AddEventListener(DaPlayerEvents.SetHero,(hero) => {
				let callbacks = this._callbacks[DaMonsterEvents.SetHero];
				if (callbacks) {
					callbacks.forEach((c) => {
						c.call(null, p, hero);
					})
				}
				
				if (p.isNPC){
					p.DoARound(this._players, this.availableMonsters);
				}
			});

			p.AddEventListener(DaPlayerEvents.EquipHero,(card) => {
				let callbacks = this._callbacks[DaMonsterEvents.EquipHero];
				if (callbacks) {
					callbacks.forEach((c) => {
						c.call(null, p, card);
					})
				}
								
				if (p.isNPC){
					p.DoARound(this._players, this.availableMonsters);
				}				
			});

									
			
			p.AddEventListener(DaPlayerEvents.StartAction,(card, args) => {
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
					}else{
						player.isActionDone = true;
					}
				})
				
				let callbacks = this._callbacks[DaMonsterEvents.ActionStart];
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

	private initActionCards() {
		Object.keys(DaActions).filter(key => !isNaN(Number(key))).forEach((index) => {

			switch (parseInt(index)) {
				case DaActions.AtomicBomb:
					DaActionCard.callbacks[index] = (player) => {
						console.log("Action card (Atomic bomb) played");								
						//monster
						if (this.monsterCard) {
							player.monsterKilled.push(this.monsterCard);
							this.monsterCard = undefined;
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
						
						this.monsterCard = monsterCard;
					}
					break;

				case DaActions.Stop:
					//Stopping logic is handled in daMonster player play action callback event??	
					break;

				case DaActions.Radar:
					DaActionCard.callbacks[index] = (player) => {
						console.log('Radar.... %s', player);
						this.monsterCard = this._deck.NextNCards(3);
					}
					break;

				case DaActions.Steal:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log('Steal..... %s', player);
						let cardIndex = args[0];
						if (isNaN(cardIndex)) {
							throw new Error('NO CARD to steal.. (card index is empty)!!!!');
						}
						let target = player.isNPC 
							? this.player 
							: this.npc,							
							card = target.hand[cardIndex];
						target.hand.splice(cardIndex, 1);							 
						player.hand.push(card);
						return card;
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
							this.players[0].hero = undefined;
							this.players[1].hero = undefined;
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
	
	
	
	Battle() {
		console.log('BATTLE');
		if (!this.monsterCard){
			throw new Error("No monster to BATTLE!!!");
		}

		let maxPointPlayer = null,
			winner = null,
			isPlayerWin = false;
		this._players.forEach((p: DaPlayer) => {
			//TODO::how about equal point????
			if (p.hero && (!maxPointPlayer || maxPointPlayer.hero.totalPoint < p.hero.totalPoint)) {
				maxPointPlayer = p;
			}
		});

		if (!maxPointPlayer || this.monsterCard.point > maxPointPlayer.hero.totalPoint) {
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
		
		let callbacks = this._callbacks[DaMonsterEvents.BattleDone];
		if (callbacks) {
			callbacks.forEach((c) => {
				c.call(null, isPlayerWin, winner);
			})
		}			
				
		this.monsterCard = undefined;
		if (!this._isProvokeBattle){
			this.NextPlayer();
		}else{
			let activePlayer = this._players.find((p) => {return p.isActive;});
			if (activePlayer.isNPC){
				activePlayer.DoARound(this._players, this.availableMonsters);
			}												
		}				
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
		
		this._players[0].isActive = true;		
	}

	ExeCardAction() {
		if (this.playedActions.length > 0) {
			let action = this.playedActions[0],
				result;
			if (!action.isStopped){
				//do action
				result = action.card.Play(action.player, action.args);
			}
			
			let callbacks = this._callbacks[DaMonsterEvents.ActionExec];
			if (callbacks) {
				callbacks.forEach((c) => {
					c.call(null, action, result);
				})
			}												
						
			this.playedActions = [];	
			
			let activePlayer = this._players.find((p) => {return p.isActive;});
			if (activePlayer.isNPC){
				activePlayer.DoARound(this._players, this.availableMonsters);
			}												
		}
		
		
	}
	
	NextPlayer(){
		let index = this._players.findIndex((p) => { return p.isActive;});		
		this._players[index].isActive = false;
		index = (index >= this._players.length - 1) ? 0 : index + 1;
		this._players[index].isActive = true;	
		
		if (this._players[index].isNPC){
			this._players[index].DoARound(this._players, this.availableMonsters);
		}	
	}			

}
