



public hookUpGame(game:DaMonsterGame){
    this.game!.AddEventListener(DaMonsterGameEvents.DoneDrawFromDeck, (player, card) =>{
        this.animation = this.animation.then(() => {
            return this.playerAddCardFromDeck(player.isNPC ? this.npc : this.player, card);
        }).then(() => {
            return this.switchToPlayer(player.isNPC ? this.player : this.npc);
        });
    });
    this.game!.AddEventListener(DaMonsterGameEvents.SetHero, (player, hero) =>{            
         this.animation = this.animation.then(() => {
             return this.playerHeroSet(player.isNPC ? this.npc : this.player, hero);  
         }).then(() =>{
             return this.delayForNSec();
         });              
    });
    this.game!.AddEventListener(DaMonsterGameEvents.EquipHero, (player, item) =>{
        this.animation = this.animation.then(() =>{
            return this.playerEquipHero(player.isNPC ? this.npc : this.player, item);
        }).then(() =>{
             return this.delayForNSec();
         });
    });
    this.game!.AddEventListener(DaMonsterGameEvents.MonsterInvade, (monster) =>{            
        //TODO:: npc can play an action (e.g. atomic or retreat...)
        
        this.animation = this.animation.then(() =>{
                return this.deck!.Serve(monster.id, monster.point, monster.type, monster.heroType, monster.action, Deck_com_serve_direction.Flip);
        }).then(() =>{
            return this.effect!.monsterInvade(monster.point);
        }).then(() =>{                
            this.player!.isBattleOn = true;
            return this.delayForNSec();
        });
    });
    this.game!.AddEventListener(DaMonsterGameEvents.BattleDone, (isPlayerWin, winner, activePlayer) =>{
        this.player!.isBattleOn = false;
        if (isPlayerWin){
            let player = winner.isNPC ? this.npc : this.player;
            this.animation = this.animation.then(() =>{
                return this.effect!.doneBattle(player);                    
            }).then(() =>{
                return this.deck!.RemoveTop();
            }).then(() =>{
                console.log('com::damonster -- kill a monster')
                return player!.KillAMonster();
            });                                
        }else{
            this.animation = this.animation.then(() => {
                let promises = [];
                promises.push(this.deck!.AddAVailableMonster(winner.id, winner.point));
                promises.push(this.playerHeroSet(this.player, null));
                promises.push(this.playerHeroSet(this.npc, null));
                return Promise.all(promises);
            });
        }
        this.animation = this.animation.then(() =>{
            return this.switchToPlayer(activePlayer.isNPC ? this.npc : this.player);
        })            
    });
    this.game!.AddEventListener(DaMonsterGameEvents.ActionStart, (player, card) =>{
        if (player.isNPC){
            let daCard = this.npc!.GetCardById(card.id);
            this.animation = this.animation.then(() =>{
                return (daCard as Card_com).flip();                                                                        
            }).then(() =>{
                this.player!.isActionOn = true;
                return Promise.resolve();
            });                                                
        }
    });              
    this.game!.AddEventListener(DaMonsterGameEvents.ActionDone, (action, cards) =>{
        
        this.player!.isActionOn = false;
        
        //remove all played card
        this.animation = this.animation.then(() => {
            let cardRemovalPromises: any[] = [];
            cards.forEach((r: any) => {
                let player = r.player.isNPC ? this.npc : this.player;
                cardRemovalPromises.push(player!.RemoveHand(r.cardId));                        
            });
            return Promise.all(cardRemovalPromises);                                        
        });
        
        //show the result
        if (!action.isStopped){
            let promises: any[] = [];
            let player = action.player.isNPC ? this.npc : this.player,
                actionCard = action.card;
                                                                
            switch(action.card.action){
            case DaActions.Steal:
                //let index = action.args[0];
                this.animation = this.animation.then(() =>{
                    let daCard = new Card_com(),
                        result = action.result,
                        target = action.player.isNPC ? this.player : this.npc;
                    daCard.Set(result.id, result.point, result.type, result.heroType, result.action, false);
                    promises.push(player!.AddHand(daCard));
                    promises.push(target!.RemoveHand(result.id));
                    return Promise.all(promises);                        
                });                   
            break;
            
            case DaActions.Radar:
                this.animation = this.animation.then(() =>{
                    promises.push(this.deck!.ShowNCard(action.result));
                    return Promise.all(promises);
                })
                
            break;
            
            case DaActions.AtomicBomb:
                this.animation = this.animation.then(() =>{
                    let monsterCard = action.result;                       
                    promises.push(this.playerHeroSet(this.player, null));
                    promises.push(this.playerHeroSet(this.npc, null));
                    if (monsterCard){
                        promises.push(this.deck!.RemoveTop());
                        promises.push(player!.KillAMonster());
                    }
                    
                    //cancel battle if there is any...
                    this.player!.isBattleOn = false;
                    
                    return Promise.all(promises);
                });                
            break;
            
            case DaActions.Attack:
                this.animation = this.animation.then((result: any) =>{
                    if (!result){
                        //TODO:: both lose
                    }
                    let loser = result.isNPC ? this.npc : this.player;
                    promises.push(this.playerHeroSet(loser, null));
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
    this.deck!.addEventListener(Deck_com_events.Draw, (e) =>{            
        this.game!.player.DrawFromDeck();
    });                
    
    //-- npc -------------------------------------------------                                  
    this.npc!.InitHand(
        this.game!.npc.hand.map((c:any) => {
            let daCard = new Card_com();
            daCard.Set(c.id, c.point, c.type, c.heroType, c.action,  false);
            return daCard;
        })
    );
                    
            
    //-- player -------------------------------------------------                        
    this.player!.InitHand(        
        this.game!.player.hand.map((c:any) =>{
            let daCard = new Card_com();
            daCard.Set(c.id, c.point, c.type, c.heroType, c.action, true);
            return daCard;
        })
    );        

    this.player!.addEventListener(Player_com_events.SetHero, (e: any)=>{
        this.game!.player.SetHero(e.detail.card.id);
    });              
    this.player!.addEventListener(Player_com_events.EquipHero, (e:any)=>{
        this.game!.player.EquipHero(e.detail.card.id);
    });
    this.player!.addEventListener(Player_com_events.DoAction, (e:any)=>{
        switch (e.detail.card.action){
            case DaActions.Steal:
                this.game!.player.PlayAnAction(e.detail.card.id, 0);                                
            break;
            default:
                this.game!.player.PlayAnAction(e.detail.card.id);
            break;
        }            
    });         
    this.player!.addEventListener(Player_com_events.DoBattle, (e:any) => {            
        this.animation = this.animation.then(() =>{
            this.game!.Battle();
            return Promise.resolve();
        });
    });
    this.player!.addEventListener(Player_com_events.SkipAction, (e:any) => {
        this.player!.isActionOn = false;
        this.game!.player.SkipAction();
    })          
}