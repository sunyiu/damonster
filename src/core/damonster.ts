import { DaDeck, DaDeckEvents, GetDefaultCards } from "./deck.js"
import { DaPlayer, DaPlayerTypes, DaPlayerEvents } from "./player.js"
import { DaCardType } from "./card.js"
import { DaHeroCard } from "./herocard.js"
import { DaActions, DaActionCard } from  "./actioncard.js"
import { DaNpc } from "./npc.js"


export default class DaMonster {

	private _isStarted: boolean = false;
	// get isStarted(){
	// 	return this._isStarted;
	// }
	// set isStarted(value){
	// 	this._isStarted = value;
	// }
	
	private _monster: DaCard | undefined;
	// get monster(){
	// 	return this._monster;
	// }
	// set monster(value){
	// 	this._monster = value;
	// }
		
	private _deck: DaDeck;
	private _players: DaPlayer[] = [];
	private _discarded: DaCard[] = [];

	private _isBattle: boolean = false;
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
		this._deck.AddEventListener(DaDeckEvents.MonsterFound,(monster) => {

			this.monsterInvade();
		});
	}

	private initPlayers() {
		let p1 = new DaPlayer("p1", this._deck),
			p2 = new DaNpc("npc", this._deck);

		this._players.push(p1, p2);
		this._players.forEach((p, index) => {

			p.AddEventListener(DaPlayerEvents.DoneDrawFromDeck,() => {
				console.log('p %s done draw from deck', p.name);

				if (this._isStarted) {
					let nextIndex = index + 1;
					nextIndex = nextIndex >= this._players.length ? 0 : nextIndex;

					let nextPlayer = this._players[nextIndex];

					if (nextPlayer.type == DaPlayerTypes.Npc) {
						nextPlayer.Play();
					}
				}
			});

			p.AddEventListener(DaPlayerEvents.PlayAction,(card, args) => {
				console.log('p %s play an action %o', p.name, card, args);

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

				// if (card.action != DaActions.Stop) {
				// 	this._pendingAction = (isStop) => {
				// 		return new Promise((resolve, reject) => {
				// 			resolve(isStop, p, card, args);
				// 		}).then((isStop, player, card, args) => {
				// 			if (isStop){
				// 				console.log("Stop action");
				// 			}else{
				// 				card.Play(player, args);
				// 			}
				// 		});
				// 	}
				// } else {
				// 	
				// 	
				// 	
				// 	
				// 	//Stop the Stop????
				// 	this._pendingAction(false);
				// 	this._pendingAction = undefined;
				// }

				this._players.forEach((npc) => {
					if (p !== npc && npc.type == DaPlayerTypes.Npc) {
						//NPC react to action of player
						npc.ReactOnAction(this._pendingAction);
					}
				})
			});

			// p.AddEventListener(DaPlayerEvents.DoneAction,() => {
			// 	p.canAction = false;
			// 
			// 	//check if all done
			// 	if (this._players.every((p) => { return !p.canAction; })) {
			// 		this.battle();
			// 	}
			// });
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
					break;

				case DaActions.Radar:
					DaActionCard.callbacks[index] = (player) => {
						console.log('Radar.... %o', player);
						return this._deck.NextNCards(3);
					}
					break;

				case DaActions.Steal:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log('Steal..... %o', player);
						let card = args[0];
						if (!card) {
							throw new Error('Card not found on steal!!!!');
						}
						player.hand.push(cards);
					}
					break;

				case DaActions.Super:
					DaActionCard.callbacks[index] = (player) => {
						console.log('Suuuuuper... %o', player);
						player.attack = 10000;
					}
					break;

				case DaActions.PerfectCube:
					DaActionCard.callbacks[index] = (player) => {
						console.log('Perfect cube.... %o', player);
						player.defense = 100000;
					}
					break;

				case DaActions.Swap:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log("Swap......")
						let heroCard = args[0];
						if (!heroCard) {
							throw new Error("Hero card not found for swap");
						}
						if (player.hand.find((c) => { return c === heroCard; })) {
							throw new Error("Hero card is found in the player hand");
						}
						if (heroCard.type != DaCardType.Hero) {
							throw new Error("Card type is not hero in swap");
						}

						player.hero = heroCard;
					}
					break;

				case DaActions.Attack:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log('Attack action by %o', player);
					}
					break;
			}
		})
	}

	private monsterInvade(monster) {
		console.log('MONSTER %o invade', monster);
		this._monster = monster;
		this._players.forEach((p) => {
			//p.canAction = true;

			if (p.type == DaPlayerTypes.Npc) {
				p.MonsterInvade(monster);
			}
		})
		
		//wait for actions
		console.log('wait for player actions');
	}

	private battle() {
		console.log('BATTLE');
		if (!this._monster) {
			//monster already been killed even before the battle
			return;
		}

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
		
		//reset player attack and defense
		

		this._monster = undefined;
		this._isBattle = false;
	}

	New() {
		this._isStarted = false;
		let cards = GetDefaultCards();
		this._deck.Empty();
		this._deck.AddCardsAndShuffle([].concat(cards.hero, cards.item, cards.skill));

		this._players.forEach((p, index) => {
			p.New();
			//there wont be any monster card at this point of time...
			for (var i = 5; i > 0; i--) {
				p.DrawFromDeck();
			}
		})
		this._deck.AddCardsAndShuffle(cards.monster);
		this._isStarted = true;
	}

	ExeCardAction() {
		if (this._pendingAction) {
			if (!this._pendingAction.isStopped){
				this._pendingAction.card.Play(this._pendingAction.player, this._pendingAction.args);
			}
		}
		this._pendingAction = undefined;
	}


}
