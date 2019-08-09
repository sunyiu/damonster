
let game = new damonster.DaMonsterGame(),
    component = document.getElementById('game');


component.switchToPlayer(false);


game.AddEventListener(damonster.DaMonsterGameEvents.DoneDrawFromDeck, (player, card) =>{
    component.playerAddCardFromDeck(player.isNPC, {id: card.id, point: card.point, cardType: card.type, heroType: card.heroType, action: card.action});
    component.switchToPlayer(player.isNPC)
});
game.AddEventListener(damonster.DaMonsterGameEvents.SetHero, (player, hero) =>{            
    if (hero){
        component.playerHeroSet(player.isNPC, {id:hero.id, type:hero.type, point:hero.point});
    }else{
        component.playerHeroSet(player.isNPC)
    }
    component.delayForNSec();
});
game.AddEventListener(damonster.DaMonsterGameEvents.EquipHero, (player, item) =>{
    component.playerEquipHero(player.isNPC,
        {id:item.id, point:item.point, cardType:item.type, heroType: item.heroType});
    component.delayForNSec();
});
game.AddEventListener(damonster.DaMonsterGameEvents.MonsterInvade, (monster) =>{            
    //TODO:: npc can play an action (e.g. atomic or retreat...)
    component.monstrInvade(monster.id, monster.point, monster.type, monster.heroType, monster.action);
});
game.AddEventListener(damonster.DaMonsterGameEvents.BattleDone, (isPlayerWin, winner, activePlayer) =>{
    let temp = isPlayerWin ? (winner.isNPC ? 'npc' : 'player') : 'monster';
    component.battleDone(temp, winner.id, winner.point, activePlayer.isNPC);
});
game.AddEventListener(damonster.DaMonsterGameEvents.ActionStart, (player, card) =>{
    component.actionStart(player.isNPC, card.id);
});              
game.AddEventListener(damonster.DaMonsterGameEvents.ActionDone, (action, cards) =>{
    let c = cards.map((c)=>{
        return {
            id: c.cardId,
            isNPC: c.player.isNPC
        }
    }),
    args;

    // AtomicBomb - 0
    // Stop - 1
    // Radar - 2
    // Steal - 3
    // Retreat - 4
    // Provoke -5
    // Attack - 6
    // SuicideBelt - 7
    // MindReading - 8
    switch(action.card.action){
        case 2:
            args = {
                cardIds: action.result.map((c) =>{
                    return c.id;
                })
            };
            break;

        case 3:
            args ={
                card:{
                    id: action.result.id,
                    point: action.result.point,
                    type: action.result.type,
                    heroType: action.result.heroType,
                    action: action.result.action
                }
            };
            break;
        case 0:
            args = {
                //monster card
                card: {
                    id: action.result.id
                }
            }
            break;

        case 6:
            args = {
                winner: result ? (result.isNPC ? 'npc' : 'player') : "none"
            }
            break;    
    }

    component.ActionDone(
        c,
        {
            id: action.card.action,
            cardId: action.card.id,
            isStopped: action.isStopped,
            isNPC: action.player.isNPC,
            args: args
        }
    );    
});
                        



//TODO:: take all event to root level
//-- deck ------------------------------------------        
component.deck.addEventListener(Deck_com_events.Draw, (e) =>{            
    game.player.DrawFromDeck();
});                

//-- npc -------------------------------------------------                                  
component.npc.InitHand(
    game.npc.hand.map((c) => {
        return {
            id: c.id,
            point: c.point,
            type: c.type,
            heroType: c.heroType,
            action: c.action,
            flip: false
        };        
    })
);
                
        
//-- player -------------------------------------------------                        
component.player.InitHand(  
    game.player.hand.map((c) =>{
        return {
            id: c.id,
            point: c.point,
            type: c.type,
            heroType: c.heroType,
            action: c.action,
            flip: true
        };         })
);        

component.player.addEventListener(Player_com_events.SetHero, (e)=>{
    game.player.SetHero(e.detail.card.id);
});              
component.player.addEventListener(Player_com_events.EquipHero, (e)=>{
    game.player.EquipHero(e.detail.card.id);
});
component.player.addEventListener(Player_com_events.DoAction, (e)=>{
    switch (e.detail.card.action){
        case DaActions.Steal:
            game.player.PlayAnAction(e.detail.card.id, 0);                                
        break;
        default:
            game.player.PlayAnAction(e.detail.card.id);
        break;
    }            
});         
component.player.addEventListener(Player_com_events.DoBattle, (e) => {            
    game.Battle();
    // this.animation = this.animation.then(() =>{
    //     game.Battle();
    //     return Promise.resolve();
    // });
});
component.player.addEventListener(Player_com_events.SkipAction, (e) => {
    component.player.isActionOn = false;
    game.player.SkipAction();
})          

