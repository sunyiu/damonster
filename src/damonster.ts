'use strict';

//core
import DaMonster from './core/damonster.js'
import {DaCard} from './core/card.js'
import { DaPlayer, DaPlayerEvents } from './core/player.js'  
import { DaNpc, DaNpcStatus } from './core/npc.js'    

//web component                
import DaMonsterPlayer from './component/damonsterplayer.js'
import DaMonsterNpc from './component/damonsternpc.js'
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
        this.playerComponent = new DaMonsterPlayer();
        this.npcComponent = new DaMonsterNpc();
        this.tableComponent = new DaMonsterTable();

        this.bindPlayer(this.player, this.playerComponent, this.npcComponent);
        this.bindNpc(this.npc, this.npcComponent);
        this.bindDaMonster(this.daMonster);

        container.appendChild(this.npcComponent);
        container.appendChild(this.tableComponent);
        container.appendChild(this.playerComponent);

        this.daMonster.New();
    }

    private bindDaMonster(daMonster) {
        Observable.addListener(daMonster, 'tableCard',(newValue) => {
            Promise.all([this.npcComponent.done]).then(() => {
                this.tableComponent.setTable(newValue);
            });
        });

        Observable.addListener(daMonster, 'availableMonsters',(newValue) => {
            this.tableComponent.setAvailableMonsters(this.daMonster.availableMonsters);
        });

        //         Observable.addListener(daMonster, 'currentPlayer',(newValue) => {
        //             this.npcComponent.setAttribute('data-is-active', newValue.isNPC);
        //             this.playerComponent.setAttribute('data-is-active', !newValue.isNPC);
        // 
        //             if (newValue.isNPC) {
        //                 setTimeout(() => {
        //                     this.npc.DoARound(daMonster.players, daMonster.availableMonsters);
        //                 })
        //             }
        //         });

        Observable.addListener(daMonster, 'playedActions',(newValue) => {
            Promise.all([this.npcComponent.done]).then(() => {
                if (daMonster.playedActions.length == 0) {
                    this.tableComponent.setTable();
                    //this.npcComponent.endAction();
                    this.playerComponent.endAction();

                    if (this.npcComponent.getAttribute('data-is-active') == 'true') {
                        this.npc.DoARound(daMonster.players, daMonster.availableMonsters);
                    }
                } else {
                    let action = daMonster.playedActions[daMonster.playedActions.length - 1];
                    this.tableComponent.setTable(action.card);

                    if (!action.player.isNPC) {
                        this.npcComponent.addAction('react-action');
                    } else {
                        this.playerComponent.reactAction();
                    }
                }
            })
        });

        this.tableComponent.addEventListener('battle',(e) => {
            this.daMonster.Battle();
        });

    }

    private bindNpc(npc, component) {
        component.setAttribute('id', npc.name);

        Observable.addListener(npc, 'isActive',(newValue) => {
            if (newValue) {
                component.done = undefined;
                npc.DoARound(this.daMonster.players, this.daMonster.availableMonsters);
            }

        });

        //         Observable.addListener(npc, 'status',(newValue) => {
        //             switch (newValue) {
        //                 case DaNpcStatus.Waiting:
        //                     break;
        // 
        //                 case DaNpcStatus.RoundStart:
        //                     break;
        // 
        //                 case DaNpcStatus.RoundEnd:
        //                     this.daMonster.NextPlayer();
        //                     break;
        //             }
        //         });

        Observable.addListener(npc, 'hand',(newValue) => {
            console.log('hand %s', newValue);
            if (newValue instanceof DaCard){
                component.addAction('set-hand', newValue);
            }else{
                component.addAction('set-hand', null);
            }
        });

        Observable.addListener(npc, 'monsterKilled',(newValue) => {
            component.addAction('monster-killed', newValue.id);
            //component.addMonsterKilled(newValue.id);
        });

        Observable.addListener(npc, 'hero',(newValue) => {
            console.log('npc set hero %o');
            component.addAction('set-hero', npc.hero);

            if (newValue) {                                  
                //remove existing listener and hook to new hero.item??                                        
                //hook to new hero.item                
                Observable.addListener(newValue, 'items',(newValue) => {
                    component.addAction('equip-hero', npc.hero.items);
                });
            }
        });
        
        // component.addEventListener('skip-action',(e) => {
        //     this.daMonster.ExeCardAction();
        // });

        component.addEventListener('react-action',(e) => {
            npc.ReactOnAction();
        });

    }

    private bindPlayer(player, component, npcComponent) {
        component.setAttribute('id', player.name);

        Observable.addListener(player, 'isActive',(newValue) => {
            if (newValue) {
                npcComponent.done.then(() => {
                    console.log('player ready!!!!!!');
                    //component.setActive(newValue);
     
                });
            } else {
                //component.setActive(newValue);
            }
        });

        Observable.addListener(player, 'hand',(newValue) => {
            if (newValue instanceof DaCard){
                component.setHand(newValue);
            }
//             let handIds = component.getHandIds();
//             handIds.forEach((id) => {
//                 if (player.hand.every((i) => {
//                     return i.id != id;
//                 })) {
//                     component.removeHand(id);
//                 }
//             });
// 
//             player.hand.forEach((c, index) => {
//                 if (handIds.every((id) => {
//                     return c.id != id;
//                 })) {
//                     component.addHand(c);
//                 }
//             });
        });

        Observable.addListener(player, 'monsterKilled',(newValue) => {
            component.addMonsterKilled(newValue.id);
        });

        Observable.addListener(player, 'hero',(newValue) => {
            component.setHero(newValue);

            if (newValue) {
                component.setPoint(newValue.totalPoint);                                            
                    
                //remove existing listener and hook to new hero.item??                                        
                //hook to new hero.item                
                Observable.addListener(newValue, 'items',(newValue) => {
                    let itemIds = component.getItemIds();

                    itemIds.forEach((id) => {
                        if (player.hero.items.every((i) => {
                            return i.id != id;
                        })) {
                            component.removeItem(id);
                        }
                    });

                    player.hero.items.forEach((i) => {
                        if (itemIds.every((id) => {
                            return i.id != id;
                        })) {
                            component.addItem(i);
                        }
                    });
                    component.setPoint(player.hero.totalPoint);
                });
                component.setPoint(newValue.totalPoint);
            } else {
                component.removeAllItems();
                component.setPoint(0);
            }
        });

        component.addEventListener('provoke-arg',(e) => {
            let detail = e.detail,
                cardId = e.detail.cardId,
                card = player.hand.find((c) => {
                    return c.id == cardId;
                });

            if (detail.isNPC) {

            } else {
                this.tableComponent.pickAvailableMonster().then((id) => {
                    let player = this.daMonster.players.find((p) => { return !p.isNPC; });
                    player.PlayAnAction(card, id);
                })
            }

        })


        component.addEventListener('draw-from-deck',(e) => {
            player.DrawFromDeck();
        });
        component.addEventListener('play-card',(e) => {
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
                    player.EquipHero(card.id);
                    break;
                case 'play-action':
                    let args = e.detail.args;
                    //check if the card needs a target....
                    player.PlayAnAction(card, args);
                    break;
            }
        });
        component.addEventListener('skip-action',(e) => {
            this.daMonster.ExeCardAction();
        });

        component.addEventListener('react-action',(e) => {
            player.ReactOnAction();
        });

    }

}