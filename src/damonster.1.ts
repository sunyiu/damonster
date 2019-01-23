'use strict';

//core
 import DaMonster from './core/damonster.js'
 import {DaMonsterEvents} from  './core/damonster.js'
// import {DaCard} from './core/card.js'
// import { DaPlayer, DaPlayerComEvents } from './core/player.js'  
// import { DaNpc, DaNpcStatus } from './core/npc.js'    

//web component
import DaMonsterCard from './component/damonstercard.js'
import DaMonsterDeck from './component/damonsterdeck.js'
import {DeckServeDirection, DaDeckEvents} from './component/damonsterdeck.js'
import DaMonsterPlayer from './component/damonsterplayer.1.js'
import {DaPlayerComEvents} from './component/damonsterplayer.1.js'
// import DaMonsterNpc from './component/damonsternpc.js' 
// import DaMonsterTable from './component/damonsterTable.js'



//utilities
import Observable from './utility/observable.js';

export default class DaMonsterGame {
    
    
    private game:DaMonster;
    
    public deck:DaMonsterDeck;
    public player:DaMonsterPlayer;
    public npc:DaMonsterPlayer;
    
    private animation = Promise.resolve();
    
    
    constructor(container){
        this.game = new DaMonster();
        
        this.game.AddEventListener(DaMonsterEvents.DrawFromDeck, (player, card) =>{
            this.animation = this.animation.then(() => {
                return this.playerAddCardFromDeck(player.isNPC ? this.npc : this.player, card);
            }).then(() =>{
                console.log('COM::%o end turn', player);
                return Promise.resolve();
            }); 
        });
        this.game.AddEventListener(DaMonsterEvents.SetHero, (player, hero) =>{            
             this.animation = this.animation.then(() => {
                 return this.playerHeroSet(player.isNPC ? this.npc : this.player, hero);  
             });              
        });
        this.game.AddEventListener(DaMonsterEvents.EquipItem, (player, cardId) =>{
            this.animation = this.animation.then(() =>{
                    
            });
        });
        this.game.AddEventListener(DaMonsterEvents.MonsterInvade, (monster) =>{
            this.animation = this.animation.then(() =>{
                    return this.deck.Serve(monster.id, monster.point, monster.type, monster.heroType, monster.action, DeckServeDirection.Flip);
            });
        });
        this.game.AddEventListener(DaMonsterEvents.ActionStart, (player, card) =>{
            if (player.isNPC){
                let daCard = this.npc.GetCardById(card.id);
                this.animation = this.animation.then(() =>{
                    return daCard.flip();                                                                        
                });                
            }
        });              
        this.game.AddEventListener(DaMonsterEvents.ActionExec, (action, result) =>{
           if (!action.isStopped){
               console.log('COM::action %o', action);
               if (action.card.name == 'Steal'){
                   //let index = action.args[0];
                   this.animation = this.animation.then(() =>{
                        let promises = [],
                            daCard = new DaMonsterCard(),
                            player = action.player.isNPC ? this.npc : this.player,
                            target = action.player.isNPC ? this.player : this.npc;
                        daCard.Set(result.id, result.point, result.cardType, result.heroType, result.action);
                        promises.push(player.AddHand(daCard));
                        promises.push(target.RemoveHand(result.id));
                        return Promise.all(promises);
                        
                   })
               }
               
           }else{
               
           }
        });
              

        this.game.New();        
        
        //-- deck ------------------------------------------
        this.deck = new DaMonsterDeck();        
        this.deck.addEventListener(DaDeckEvents.Draw, (e) =>{            
            this.game.player.DrawFromDeck();
        });                
        
        //-- npc ------------------------------------------------- 
        this.npc = new DaMonsterPlayer(true);          
                
        this.npc.InitHand(
            this.game.npc.hand.map((c) => {
                let daCard = new DaMonsterCard();
                daCard.Set(c.id, c.point, c.type, c.heroType, c.action,  false);
                return daCard;
            })
        );
                        
                
        //-- player -------------------------------------------------
        this.player = new DaMonsterPlayer();
                        
        this.player.InitHand(        
            this.game.players[0].hand.map((c) =>{
                let daCard = new DaMonsterCard();
                daCard.Set(c.id, c.point, c.type, c.heroType, c.action, true);
                return daCard;
            })
        );        
              
        this.player.addEventListener(DaPlayerComEvents.EquipHero, (e)=>{
            //this.game.players[0].EquipHero(e.detail.card.id);
        });
        this.player.addEventListener(DaPlayerComEvents.DoBattle, (e) => {
            this.game.Battle();
        })
        this.player.addEventListener(DaPlayerComEvents.DoneAction, (e) => {
            this.game.player.SkipAction();
        })        
                                
        
        
        container.appendChild(this.npc);   
        container.appendChild(this.deck);
        container.appendChild(this.player);
    }
    
    
    
    
    private playerHeroSet(player, hero){
        console.log('%o set hero %o', player, hero);            
        if (!hero){
            // this.animation = player.animation.then(() => {
            //     player.hero.set();
            // });
            return;
        }
        
        return player.RemoveHand(hero.id).then(() =>{
            return player.hero.Set(hero.heroType, hero.point);
        }).then(() =>{
            Observable.addListener(hero, 'items',(item) => {
                // this.npc.RemoveHand(item.id).then(() => {
                //     this.npc.EquipHero(item.point);
                // });
            });
        });            
    }
    
    // private playerHandChange(player, card){
    //     let daCard = player.GetCardById(card.id);
    //     
    //     if (!daCard){
    //         console.log('%o add card to hand %o', player, daCard);
    //         this.playerAddCardFromDeck(player, card);
    //     }else{
    //         //card will be removed from other actions
    //         // this.animation = this.animation.then(() =>{
    //         //     return player.RemoveHand(card.id);                
    //         // });
    //                          
    //     } 
    // }
    
    private playerAddCardFromDeck(player, card){
        return this.deck.Serve(
            card.id, 
            card.point, 
            card.type, 
            card.heroType, 
            card.action, 
            player.isNPC ? DeckServeDirection.Up : DeckServeDirection.DownAndFlip)
            .then((daCard)=>{
                return player.AddHand(daCard);
            });                    
    }
    
    private playerSyncHand(player, hand){
        let promises = [];
        
        hand.forEach((c) =>{
            let daCard = player.GetCardById(c.id);
            if (!daCard){
                //add card
                let daCard = new DaMonsterCard();
                daCard.Set(c.id, c.point, c.cardType, c.heroType, c.action)
                promises.push(player.AddHand(daCard));
            }                                    
        });
        
        let removeIds = [];
        player.GetHandIds().forEach((id)=>{
            let daCard = hand.find((c) => {return c.id == id});
            if (!daCard){
                //remove card
                removeIds.push(id);
            }
        })                
        removeIds.forEach((id) =>{
            console.log('com:: remove hand ' + id);
            promises.push(player.RemoveHand(id));
        })
        
        return Promise.all(promises);
    }
 }