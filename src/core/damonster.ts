import { DaDeck, DaDeckEvents, GetDefaultCards } from "./deck.js"
import { DaPlayer, DaPlayerTypes, DaPlayerEvents } from "./player.js"
import { DaCardType } from "./card.js"
import { DaHeroCard } from "./herocard.js"
import { DaActions, DaActionCard } from  "./actioncard.js"
import { DaNpc } from "./npc.js"


export default class DaMonster {

	
	private _monster: DaCard | undefined;
	private _nextPlayer: DaPlayer | undefined;
	// get monster(){
	// 	return this._monster;
	// }
	// set monster(value){
	// 	this._monster = value;
	// }
		
	private _deck: DaDeck;
	private _players: DaPlayer[] = [];
	private _discarded: DaCard[] = [];

	private _pendingAction;

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
		// this._deck.AddEventListener(DaDeckEvents.MonsterFound,(monster) => {
		// 	this.monsterInvade(monster);
		// });
	}

	private initPlayers() {
		let p1 = new DaPlayer("p1", this._deck),
			p2 = new DaNpc("npc", this._deck);

		this._players.push(p1, p2);
		this._players.forEach((p, index) => {

			p.AddEventListener(DaPlayerEvents.DoneDrawFromDeck,(monster) => {
				console.log('%s done draw from deck', p.name);

				let nextIndex = index + 1;
				nextIndex = nextIndex >= this._players.length ? 0 : nextIndex;

				let nextPlayer = this._players[nextIndex];
				
				if (monster){
					console.log('MONSTER %o invade', monster);
					this._monster = monster;
					this._nextPlayer = nextPlayer;
					this._players.forEach((p) => {
						if (p.type == DaPlayerTypes.Npc) {
							p.MonsterInvade(monster);
						}
					});
		
					//wait for actions
					console.log('wait for player actions');
				}else{							
					if (nextPlayer.type == DaPlayerTypes.Npc) {
						nextPlayer.DoARound();
					}
				}
			});
			

			p.AddEventListener(DaPlayerEvents.PlayAnAction,(card, args) => {
				console.log('%s play an action %s with args %o', p.name, card.name, args);

				if (this._pendingAction && card.action != DaActions.Stop) {
					throw new Error("Cannot play another action when there is a pending!!!!");
				}
				
				if (!this._pendingAction && card.action == DaActions.Stop){
					throw new Error("No pending action to stop!!!!");
				}
				
				if (card.action != DaActions.Stop){
					this._pendingAction = {
						player: p,
						card: card,
						args: args,
						isStopped: false
					}
				}else{
					this._pendingAction.isStopped = !this._pendingAction.isStopped;
				}												

				this._players.forEach((npc) => {
					if (p !== npc && npc.type == DaPlayerTypes.Npc) {
						//NPC react to action of player
						npc.ReactOnAction(card, args);
					}
				})
			});

			p.AddEventListener(DaPlayerEvents.ReadyBattle,() => {			
				//check if all done, then trigger battle
				if (this._players.every((p) => { return p.readyBattle; })) {
					this.battle();
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
						if (this._monster) {
							player.monsterKilled.push(this._monster);
							this._monster = undefined;
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
						let monsterCard = args[0];
						if (!monsterCard) {
							throw new Error("Monster card not found for provoke");
						}

						if (!this._discarded.find((c) => { return c === monsterCard; })) {
							throw new Error("Monster card is not from the discard pile");
						}

						if (monsterCard.type != DaCardType.Monster) {
							throw new Error("Card type is not monster in provoke");
						}
								
						//provoke monster!!!
						this.monsterInvade(monsterCard);
					}
					break;

				case DaActions.Stop:
					//Stopping logic is handled in daMonster player play action callback event??	
					break;

				case DaActions.Radar:
					DaActionCard.callbacks[index] = (player) => {
						console.log('Radar.... %s', player);
						return this._deck.NextNCards(3);
					}
					break;

				case DaActions.Steal:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log('Steal..... %s', player);
						let card = args[0];
						if (!card) {
							throw new Error('Card not found on steal!!!!');
						}
						player.hand.push(cards);
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

				case DaActions.Swap:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log("Swap......")
						player.hero = undefined;
					}
					break;

				case DaActions.Attack:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log('Attack action by %s', player);
					}
					break;
					
				case DaActions.SuicideBelt:
					//destory a target
					DaActionCard.callbacks[index] = (player, args) =>{
						let target = args[0];
						if (!target){
							throw new Error("Target player is needed for suicide belt!!!!");
						}						
						console.log('Suicide belt by %s', player);
					}
					break;
				
				case DaActions.MindReading:
					DaActionCard.callbacks[index] = (player, args) =>{
						let target = args[0];
						if (!target){
							throw new Error("Target player is needed for mind reading!!!!");
						}
						if (typeof target != 'DaPlayer'){
							throw new Error("Card type is not player in mind reading")
						}
						console.log('Mind reading to %s by %s', target, player);
					}
					break;
			}
		})
	}

	private battle() {
		console.log('BATTLE');
		if (this._monster) {
			//check monster because monster may be already killed even before the battle by some actions (atomic bomb)

			let maxPointPlayer = null;
			this._players.forEach((p: DaPlayer) => {
				//TODO::how about equal point????
				if (p.hero && (!maxPointPlayer || maxPointPlayer.hero.totalPoint + maxPointPlayer.hero.attack < p.hero.totalPoint + p.hero.attack)) {
					maxPointPlayer = p;
				}
			});

			if (!maxPointPlayer || this._monster.point > maxPointPlayer.hero.totalPoint) {
				//monster win
				console.log('monster win!!!!');
				this._discarded.push(this._monster);
				this._players.forEach((p: DaPlayer) => {
					p.hero = undefined;
				});
			} else {
				console.log('player win!!!!!');
				//check for each player
				this._players.forEach((p, index) => {
					if (p.hero && p.hero.totalPoint + p.hero.defense < this._monster.point) {
						p.hero = undefined;
					}
				});

				maxPointPlayer.monsterKilled.push(this._monster);
			}
		}
		
		if (this._nextPlayer.type == DaPlayerTypes.Npc){
			this._nextPlayer.DoARound();
		}
		
		//reset 
		this._players.forEach((p) => {
			p.readyBattle = false;
		});						
		this._nextPlayer = undefined;
		this._monster = undefined;		
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
	}

	ExeCardAction() {
		if (this._pendingAction) {
			if (!this._pendingAction.isStopped){
				let result = this._pendingAction.card.Play(this._pendingAction.player, this._pendingAction.args);
				this._pendingAction = undefined;
				return result;
			}
		}
		
		this._pendingAction = undefined;
		return;
	}


}
