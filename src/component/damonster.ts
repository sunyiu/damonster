'use strict';

'use strict';

//core
 import DaMonsterGame from '../core/game.js'
 import {DaMonsterGameEvents} from  '../core/game.js'

//web component
import Card_com from './card.js'
import Deck_com from './deck.js'
import {Deck_com_serve_direction, Deck_com_events} from './deck.js'
import Player_com from './player.js'
import {Player_com_events} from './player.js'
import {Effect_com} from './effect.js'



export default class DaMonster_Com extends HTMLElement {
    public static get is(): string { return 'da-monster'; }

    public getTemplate(props: any): string {
        return `
            <style> 
			</style>
            <!-- shadow DOM for your element -->
            <div id="da-monster-container">
                <da-monster-player id='npc' data-type='npc'></da-monster-player>
                <da-monster-deck id='deck'></da-monster-deck>
                <da-monster-player id='player' data-type='player'></da-monstr-player>                
            </div>
        `;
    }
    
    public static get properties(){
        return{
        };
    }
   
    public static get observedAttributes(): string[] {        
        const attributes: string[] = [];

        for (let key in DaMonster_Com.properties) {
            attributes.push(key.toLowerCase());
        }
        return attributes;
    }

    private props: any = {};
       
    public constructor(){
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        for (let key in DaMonster_Com.properties) {
            this.props[key] = DaMonster_Com.properties[key].value;
        }                        

        this.requestRender();
        this.init();                                                                       
    }    
    
    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        
        template.innerHTML = this.getTemplate({});
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    
    //-------------------------------------------------------------------------------    
    private game:DaMonsterGame;
    private npc:Player_com;
    private player:Player_com;
    private deck:Deck_com;
    private animation:Promise = Promise.resolve();
    
    private init():void{
        this.npc = this.shadowRoot.getElementById('npc');
        this.player = this.shadowRoot.getElementById('player');
        this.deck = this.shadowRoot.getElementById('deck');
        
        this.game = new DaMonsterGame();
        this.game.New();        
        this.hookUpGame();
    }
    
    private hookUpGame(){
        this.game.AddEventListener(DaMonsterGameEvents.DrawFromDeck, (player, card) =>{
            this.animation = this.animation.then(() => {
                return this.playerAddCardFromDeck(player.isNPC ? this.npc : this.player, card);
            }).then(() =>{
                console.log('COM::%o end turn', player);
                return this.delayForNSec();
            }); 
        });
        this.game.AddEventListener(DaMonsterGameEvents.SetHero, (player, hero) =>{            
             this.animation = this.animation.then(() => {
                 return this.playerHeroSet(player.isNPC ? this.npc : this.player, hero);  
             }).then(() =>{
                 return this.delayForNSec();
             });              
        });
        this.game.AddEventListener(DaMonsterGameEvents.EquipHero, (player, item) =>{
            this.animation = this.animation.then(() =>{
                return this.playerEquipHero(player.isNPC ? this.npc : this.player, item);
            }).then(() =>{
                 return this.delayForNSec();
             });
        });
        this.game.AddEventListener(DaMonsterGameEvents.MonsterInvade, (monster) =>{
            this.animation = this.animation.then(() =>{
                    return this.deck.Serve(monster.id, monster.point, monster.type, monster.heroType, monster.action, Deck_com_serve_direction.Flip);
            }).then(() =>{                
                this.player.isBattleOn = true;
                return this.delayForNSec();
            });
        });
        this.game.AddEventListener(DaMonsterGameEvents.BattleDone, (isPlayerWin, winner) =>{
            this.player.isBattleOn = false;
            if (isPlayerWin){
                let player = winner.isNPC ? this.npc : this.player;
                this.animation = this.animation.then(() =>{
                    return this.deck.RemoveTop();
                }).then(() =>{
                    return player.KillAMonster();
                }).then(() =>{
                 return this.delayForNSec();
                });                                
            }else{
                this.animation = this.animation.then(() => {
                    let promises = [];
                    promises.push(this.deck.AddAVailableMonster(winner.id, winner.point));
                    promises.push(this.playerHeroSet(this.player, null));
                    promises.push(this.playerHeroSet(this.npc, null));
                    return Promise.all(promises);
                }).then(() =>{
                 return this.delayForNSec();
             });
            }            
        });
        this.game.AddEventListener(DaMonsterGameEvents.ActionStart, (player, card) =>{
            if (player.isNPC){
                let daCard = this.npc.GetCardById(card.id);
                this.animation = this.animation.then(() =>{
                    return daCard.flip();                                                                        
                }).then(() =>{
                    this.player.isActionOn = true;
                    return Promise.resolve();
                });                                                
            }
        });              
        this.game.AddEventListener(DaMonsterGameEvents.ActionDone, (action, cards) =>{
            console.log('COM::action %o, card id(s) - %o', action, cards);
            
            this.player.isActionOn = false;
            
            //remove all played card
            this.animation = this.animation.then(() => {
                let cardRemovalPromises = [];
                cards.forEach((r) => {
                    let player = r.player.isNPC ? this.npc : this.player;
                    cardRemovalPromises.push(player.RemoveHand(r.cardId));                        
                });
                return Promise.all(cardRemovalPromises);                                        
            });
            
            //show the result
            if (!action.isStopped){
                let promises = [];
                let player = action.player.isNPC ? this.npc : this.player,
                    actionCard = action.card;
                                                                    
                switch(action.card.name){
                case 'Steal':
                    //let index = action.args[0];
                    this.animation = this.animation.then(() =>{
                        let daCard = new Card_com(),
                            result = action.result,
                            target = action.player.isNPC ? this.player : this.npc;
                        daCard.Set(result.id, result.point, result.cardType, result.heroType, result.action);
                        promises.push(player.AddHand(daCard));
                        promises.push(target.RemoveHand(result.id));
                        return Promise.all(promises);                        
                    });                   
                break;
                
                case 'Radar':
                    this.animation = this.animation.then(() =>{
                        promises.push(this.deck.ShowNCard(result));
                        return Promise.all(promises);
                    })
                    
                break;
                
                case 'Atomic Bomb':
                    this.animation = this.animation.then(() =>{
                        let hasMonster = action.result;                       
                        promises.push(this.playerHeroSet(this.player, null));
                        promises.push(this.playerHeroSet(this.npc, null));
                        if (hasMonster){
                            promises.push(player.KillAMonster());
                        }
                        
                        //cancel battle if there is any...
                        this.player.isBattleOn = false;
                        
                        return Promise.all(promises);
                    });                
                break;
                
                case 'Attack':
                    this.animation = this.animation.then(() =>{
                        let loser = result.isNPC ? this.npc : this.player;
                        promises.push(playerHeroSet(loser, null));
                        return Promise.all(promises);                        
                    });
                break;                
               }
               
               this.animation = this.animation.then(() =>{
                   return this.delayForNSec();
               });                  
            }                                             
        });
                              
        //-- deck ------------------------------------------        
        this.deck.addEventListener(Deck_com_events.Draw, (e) =>{            
            this.game.player.DrawFromDeck();
        });                
        
        //-- npc -------------------------------------------------                                  
        this.npc.InitHand(
            this.game.npc.hand.map((c) => {
                let daCard = new Card_com();
                daCard.Set(c.id, c.point, c.type, c.heroType, c.action,  false);
                return daCard;
            })
        );
                        
                
        //-- player -------------------------------------------------                        
        this.player.InitHand(        
            this.game.player.hand.map((c) =>{
                let daCard = new Card_com();
                daCard.Set(c.id, c.point, c.type, c.heroType, c.action, true);
                return daCard;
            })
        );        

        this.player.addEventListener(Player_com_events.SetHero, (e)=>{
            this.game.player.SetHero(e.detail.card.id);
        });              
        this.player.addEventListener(Player_com_events.EquipHero, (e)=>{
            this.game.player.EquipHero(e.detail.card.id);
        });
        this.player.addEventListener(Player_com_events.DoAction, (e)=>{
            switch (e.detail.card.name){
                case 'Steal':
                    this.game.player.PlayAnAction(e.detail.card.id, 0);                                
                break;
                default:
                    this.game.player.PlayAnAction(e.detail.card.id);
                break;
            }            
        });         
        this.player.addEventListener(Player_com_events.DoBattle, (e) => {
            this.player.isBattle = false;
            this.game.Battle();
        });
        this.player.addEventListener(Player_com_events.SkipAction, (e) => {
            this.player.isActionOn = false;
            this.game.player.SkipAction();
        })          
    }
    
            
    private playerHeroSet(player, hero){
        console.log('%o set hero %o', player, hero);            
        if (!hero){
            return player.hero.Set();
        }
        
        return player.RemoveHand(hero.id).then(() =>{
            return player.hero.Set(hero.heroType, hero.point);
        }).then(() =>{
            return Promise.resolve();
        });            
    }
    
    private playerEquipHero(player, card){
        return player.RemoveHand(card.id).then((card) =>{
            return player.hero.Equip(card);
        });                    
    }
        
    private playerAddCardFromDeck(player, card){
        return this.deck.Serve(
            card.id, 
            card.point, 
            card.type, 
            card.heroType, 
            card.action, 
            player.isNPC ? Deck_com_serve_direction.Up : Deck_com_serve_direction.DownAndFlip)
            .then((daCard)=>{
                return player.AddHand(daCard);
            });                    
    }
    
    
    private delayForNSec(sec: number | undefined){
        if (!sec){
            sec = 0.5;
        }
        return new Promise((resolve, reject) => {
            setTimeout(function() {
                resolve();                
            }, sec * 1000);
        })        
    }          
}

customElements.define(DaMonster_Com.is, DaMonster_Com);