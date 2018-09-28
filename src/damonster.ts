'use strict';

//core
import DaMonster from './core/damonster.js'
import { DaPlayer, DaPlayerEvents } from './core/player.js'      

//web component                
import DaMonsterPlayer from './component/damonsterplayer.js'
import DaMonsterCard from './component/damonstercard.js'
import DaMonsterTable from './component/damonsterTable.js'

//utilities
import Observable from './utility/observable.js';

export default class DaMonsterGame {

    private daMonster: DaMonster;
    private player: DaPlayer;
    private npc: DaPlayer;

    private playerComponent: DaMonsterPlayer;
    private npcComponent: DaMonsterPlayer;
    private tableComponent: DaMonsterTable;
    
    constructor(container) {
        this.daMonster = window.daMonster = new DaMonster();
        this.player = this.daMonster.players.find((p) => { return !p.isNPC; });
        this.npc = this.daMonster.players.find((p) => { return p.isNPC; });
                                                   
        //data binding to component...
        //swap whatever variable we needed to proxy so that we can do the binding....
        this.playerComponent = this.bindPlayer(this.player);
        this.npcComponent = this.bindPlayer(this.npc);


        this.tableComponent = this.bindTable();


        container.appendChild(this.npcComponent);
        container.appendChild(this.tableComponent);
        container.appendChild(this.playerComponent);

        this.daMonster.New();
    }

    private bindPlayer(player) {
        let playerComponent = new DaMonsterPlayer();
        if (player.isNPC) {
            playerComponent.setNPC();
        }

        playerComponent.setAttribute('id', player.name);

        Observable.addListener(player, 'hand',(newValue) => {

            let handIds = playerComponent.getHandIds();
            handIds.forEach((id) => {
                if (player.hand.every((i) => {
                    return i.id != id;
                })) {
                    playerComponent.removeHand(id);
                }
            });

            player.hand.forEach((c, index) => {
                if (handIds.every((id) => {
                    return c.id != id;
                })) {
                    playerComponent.addHand(c);
                }
            });
        });

        Observable.addListener(player, 'monsterKilled',(newValue) => {
            playerComponent.addMonsterKilled(newValue.id);
        });

        Observable.addListener(player, 'hero',(newValue) => {
            playerComponent.setHero(newValue);

            if (newValue) {
                playerComponent.setPoint(newValue.totalPoint);                                            
                    
                //remove existing listener and hook to new hero.item??                                        
                //hook to new hero.item                
                Observable.addListener(newValue, 'items',(newValue) => {
                    let itemIds = playerComponent.getItemIds();

                    itemIds.forEach((id) => {
                        if (player.hero.items.every((i) => {
                            return i.id != id;
                        })) {
                            playerComponent.removeItem(id);
                        }
                    });

                    player.hero.items.forEach((i) => {
                        if (itemIds.every((id) => {
                            return i.id != id;
                        })) {
                            playerComponent.addItem(i);
                        }
                    });
                    playerComponent.setPoint(player.hero.totalPoint);
                });
                playerComponent.setPoint(newValue.totalPoint);
            } else {
                playerComponent.removeAllItems();
                playerComponent.setPoint(0);
            }

        });

        if (!player.isNPC) {
            this.daMonster.players.forEach((opponent) => {
                if (opponent === player) {
                    return;
                }
                opponent.AddEventListener(DaPlayerEvents.PlayAnAction,(card, args) => {
                    playerComponent.responseAction();
                });
            });



            playerComponent.addEventListener('draw-from-deck',(e) => {
                player.DrawFromDeck();
            });
            playerComponent.addEventListener('play-card',(e) => {
                let action = e.detail.action,
                    cardId = e.detail.cardId,
                    card = player.hand.find((c) => {
                        return c.id == cardId;
                    });

                switch (action) {
                    case 'set-hero':
                        player.SetHero(card);
                        break;

                    case 'equip-hero':
                        player.EquipHero(card);
                        break;
                    case 'play-action':
                        let args = e.detail.args;
                        //check if the card needs a target....
                        player.PlayAnAction(card, args);
                        break;
                }
            });
            playerComponent.addEventListener('skip-action',(e) => {
                this.daMonster.ExeCardAction();
            });



        }

        return playerComponent;
    }

    private bindTable() {
        let monsterTable = new DaMonsterTable();
        Observable.addListener(this.daMonster, 'monster',(newValue) => {
            monsterTable.addAction(newValue);
        });

        Observable.addListener(this.daMonster, 'availableMonsters',(newValue) => {
            if (newValue) {
                monsterTable.addMonster(this.daMonster.availableMonsters[this.daMonster.availableMonsters.length - 1]);
            }
        });
            
        //TODO::refactor!!!!
        this.daMonster.DoneActionCallback = () => {
            //pass undefine to empty all action cards...
            monsterTable.addAction();
        };

        this.daMonster.players.forEach((player) => {
            player.AddEventListener(DaPlayerEvents.PlayAnAction,(card, args) => {
                monsterTable.addAction(card);
            });
        });

        monsterTable.addEventListener('battle',(e) => {
            this.daMonster.Battle();
        });


        return monsterTable;
    }

}