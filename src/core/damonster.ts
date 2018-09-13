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

	get players() {
		return this._players;
	}


	constructor() {			
		//DECK
		this._deck = new DaDeck();
		this._deck.AddEventListener(DaDeckEvents.MonsterFound,(monster) => {
			console.log('MONSTER %o invade', monster);
			this._monster = monster;
			this._players.forEach((p) => {
				p.doneAction = false;

				if (p.type == DaPlayerTypes.Npc) {
					p.MonsterInvade(monster);
				}
			})
		
			//wait for actions
			console.log('wait for player actions');
		});
		
		//PLAYER
		let p1 = new DaPlayer("p1", this._deck),
			p2 = new DaNpc("npc", this._deck);
		p1.next = p2;
		p2.next = p1;

		this._players.push(p1, p2);
		this._players.forEach((p) => {

			p.AddEventListener(DaPlayerEvents.DoneDrawFromDeck,() => {
				console.log('p %s done draw from deck', p.name);

				if (this._isStarted) {
					let nextPlayer = p.next;

					if (nextPlayer.type == DaPlayerTypes.Npc) {
						nextPlayer.Play();
					}
				}
			});

			p.AddEventListener(DaPlayerEvents.PlayAction,(card) => {
				console.log('p %s play an action %o', p.name, card);

				this._players.forEach((npc) => {
					if (p !== npc && npc.type == DaPlayerTypes.Npc) {
						//NPC react to action of player
						npc.ReactOnAction(card);
					}
				})
			});

			p.AddEventListener(DaPlayerEvents.DoneAction,() => {
				p.doneAction = true;
			
				//check if all done
				if (this._players.every((p) => { return p.doneAction; })) {
					this.battle();
				}
			});
		});
		
		//ACTION CARDS
		this.initActionCards();
	}

	private initActionCards() {
		Object.keys(DaActions).filter(key => !isNaN(Number(key))).forEach((index)=>{
			switch (parseInt(index)) {
				case DaActions.AtomicBomb:
					DaActionCard.callbacks[index] = (player) => {
						console.log("Action card (Atomic bomb) played");						
						//monster
						player.monsterKilled.push(this._monster);
						this._monster = undefined;						
						//heros
						this._players.forEach((p) => {
							p.hero = undefined;
						});
					}
					break;

				case DaActions.Provoke:
					DaActionCard.callbacks[index] = (player, args) =>{
						//wait for a monster to pick from discarded...
						console.log('Provoke a monster %o', args[0]);
						
						let monsterCard = args[0];
						if (!monsterCard){
							throw new Error("Monster card not found for provoke");
						}						
						
						if (!this._discarded.find((c) => {return c === monsterCard;})){
							throw new Error("Monster card is not from the discard pile");							
						}
						
						if (monsterCard.type != DaCardType.Monster){
							throw new Error("Card type is not monster in provoke");
						}
						
						//provoke monster!!!
					}
				break;
			}			
		})		
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
			if (p.hero && (!maxPointPlayer || maxPointPlayer.hero.totalPoint < p.hero.totalPoint)) {
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
			maxPointPlayer.monsterKilled.push(this._monster);
		}

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


}
