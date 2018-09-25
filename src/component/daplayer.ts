// @media screen and (device-aspect-ratio: 16/9) { … }
// @media screen and (device-aspect-ratio: 32/18) { … }
// @media screen and (device-aspect-ratio: 1280/720) { … }
// @media screen and (device-aspect-ratio: 2560/1440) { … }

'use strict';

import DaCard from './dacard.js'

export default class DaPlayer extends HTMLElement {
    public static get is(): string { return 'da-player'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-player-container{
                    position: relative;
                    margin: 10px;
                }
                
                #hand-context{
                    display: flex;
                    flex-wrap: wrap;
                }                                  
                
                #da-hero-container{
                    position: relative;
                    left: 0px
                }
                #hero-context{
                    width: 100px;
                    height: 100px;                    
                    background-size: contain;
                    background-repeat: no-repeat;  
                    background-position-y: bottom;
                    background-image: url(images/none.png);
                }
                #hero-context.k{
                    background-image: url(images/knight.png);
                }
                #hero-context.w{
                    background-image: url(images/wizard.png);
                }
                #hero-context.r{
                    background-image: url(images/ranger.png);
                }                
                
                #point-container{
                    position: absolute;
                    top: 0;
                    left: 75px;
                    height: 25px;
                    width: 25px;
                    border-radius: 23px;
                    background-color: rgba(100, 100, 100, 0.75);
                    color: white;
                    font-size: 1.35em;                    
                }
                #point-container #point-context{
                    position: absolute;
                    top: 2px;
                    left: 8px;
                }
                
                #items-container{
                    position: absolute;
                    top: 50px;
                    left: 150px;                    
                }
                
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-player-container">                                                          
                <div id="da-hero-container">
                    <div id="hero-context"></div>                                                            
                </div>
                <div id="point-container">
                    <div id="point-context"></div>
                </div>
                <div id="items-container">
                    <div id="items-context"></div>
                </div>                                
                
                <div id="da-monster-kill-container">
                    <div id="monster-context"></div>
                </div>                
                            
                <div id="da-hand-container"">
                    <div id="hand-context"></div>
                </div>
                <div id="da-button-bar">                
                    <button id="playBtn">Draw from deck</button>
                    <button id="actionBtn" disabled>Play selected</button>
                    <button id="readyBattleBtn" disabled>Ready for battle</button>
                </div>
            </div>
        `;
    }
    
    public static get properties(){
        return{
            'data-name':{
                type: String,
                value: ''
            },
            'data-hand':{
                type: String,
                value: ''
            },
            'data-hero': {
                type: String,
                value: ''
            },
            'data-point':{
                type: String,
                value: ''
            },
            'data-hero-items': {
                type: String,
                value: ''
            },
            'data-monster-killed':{
                type: String,
                value: ''
            },
            'data-monster-invade':{
                type: String,
                value: ''
            }
        };
    }
   
    public static get observedAttributes(): string[] {
        
        const attributes: string[] = [];

        for (let key in DaPlayer.properties) {
            attributes.push(key.toLowerCase());
        }

        return attributes;
    }

    private props: any = {};
    private currentAction;   

    public constructor() {
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        for (let key in DaPlayer.properties) {
            this.props[key] = DaPlayer.properties[key].value;
        }                                

        this.requestRender();

        this.shadowRoot.getElementById('playBtn').onclick = this.drawFromDeck;
        this.shadowRoot.getElementById('actionBtn').onclick = (e) =>{
            this.playAction(e.target, this.currentAction);
        }
        this.shadowRoot.getElementById('readyBattleBtn').onclick = this.battleReady;
        
    }
    
    public attributeChangedCallback(name: string, oldValue: string, newValue: string, namespace: string): void {
        if (oldValue === newValue) {
            return;
        }

        this.props[name] = newValue;
        
        if (name === 'data-hand' && newValue) {                        
            let hand = JSON.parse(newValue);
            
            //remove discarded card
            Array.from(this.shadowRoot.getElementById('hand-context').children).forEach((daCard) =>{
                let id = daCard.getAttribute('id'),
                    exist = hand.cards.find((c) => {
                        return id == 'id'+c.id;
                    });
                if (!exist){
                    daCard.remove();
                }                
            })
            
            //add new card
            hand.cards.forEach((c) =>{
                let existingCard = this.shadowRoot.getElementById('hand-context').querySelector('#id' +  c.id);                
                if (!existingCard){                
                    let card = new DaCard();
                    card.setAttribute('id', 'id'+c.id);
                    card.setAttribute('data-id', c.id);                
                    if (c.point){
                        card.setAttribute('data-point', c.point);
                    }
                    card.setAttribute('data-card-type', c.type);
                    switch (c.type){
                        case 'h':
                        case 'i':
                        card.setAttribute('data-hero', c.heroType);
                        break;
                        case 'a':
                            card.setAttribute('data-action', c.actionType)
                            break;    
                    }                           
                    card.addEventListener('card-toggle', (e)=>{
                        this.toggleCard(e.currentTarget, e.detail);
                    });
                    
                    this.shadowRoot.getElementById('hand-context').appendChild(card);
                }
            })                                                           
        }
        
        if (name === 'data-hero' && newValue){
            this.shadowRoot.getElementById('da-hero-container').classList.remove('k', 'w', 'r');
            
            // if (newValue == 'none'){                   
            //     Array.from(this.shadowRoot.getElementById('item-context').children).forEach((c) =>{
            //         c.remove();
            //     });                
            //}
            if (newValue != 'none'){                           
                let hero = JSON.parse(newValue),
                //     daHeroCard = new DaCard();
                // daHeroCard.setAttribute('id', 'id', hero.card.id);
                // daHeroCard.setAttribute('data-id', hero.card.id);                
                // daHeroCard.setAttribute('data-point', hero.card.point);
                // daHeroCard.setAttribute('data-card-type', hero.card.type);                    
                // daHeroCard.setAttribute('data-hero', hero.card.heroType);       
                                
                //this.shadowRoot.getElementById('hero-context').appendChild(daHeroCard);                
                this.shadowRoot.getElementById('hero-context').classList.add(hero.card.heroType);                
            }
        }
        
        if (name === 'data-point' && newValue){
            this.shadowRoot.getElementById('point-context').innerHTML = newValue;
        }
        
        if (name === 'data-hero-items' && newValue){
            this.shadowRoot.getElementById('items-context').innerHTML = newValue;
        }
        
        if (name === 'data-monster-killed' && newValue){
            this.shadowRoot.getElementById('monster-context').innerHTML = newValue;
        }
        
        if (name == 'data-monster-invade' && newValue){
            let readyBtn = this.shadowRoot.getElementById('readyBattleBtn');
            if (newValue == 'true'){                
                readyBtn.removeAttribute('disabled');
            }else{
                readyBtn.setAttribute('disabled', true);                
            }            
        }                                
    }
    
    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        
        template.innerHTML = this.getTemplate({});
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    
    
    private drawFromDeck(){
        this.dispatchEvent(new CustomEvent('draw-from-deck', {bubbles: true, composed: true}));
    }
    
    private battleReady(){
        this.dispatchEvent(new CustomEvent('battle-ready', {bubbles: true, composed: true}));        
    }
    
    private toggleCard(card, isSelected){
        //console.log('%o toggle selection "%s"', card, isSelected);
        
        //toggle card selectiom
        this.shadowRoot.getElementById('hand-context').querySelectorAll('da-card').forEach((c) => {
            if (c === card){
                return;
            }            
            c.setAttribute('data-is-selected', false);
        });
        
        let actionBtn = this.shadowRoot.getElementById('actionBtn');
        if (isSelected){        
            let cardType = card.getAttribute('data-card-type'),
                cardId = card.getAttribute('data-id');                
            
            switch (cardType){
                case 'h':
                    actionBtn.innerHTML = 'Set Hero';
                    this.currentAction = {
                        name: 'set-hero',
                        cardId: cardId 
                    };
                    break;
                
                case 'i':
                    actionBtn.innerHTML = 'Equip Hero';
                    this.currentAction = {
                        name: 'equip-hero',
                        cardId: cardId
                    };
                    break;
                
                case 'a':
                    actionBtn.innerHTML = 'Play Action';
                    this.currentAction = {
                        name: 'play-action',
                        cardId: cardId
                    }
                    break;
            
            }
            actionBtn.removeAttribute('disabled');     
        }else{
            actionBtn.setAttribute('disabled', true);
        }
    }   
    
    private playAction(target, action){        
        target.setAttribute('disabled', true);
        this.dispatchEvent(new CustomEvent('play-action', {detail: this.currentAction, bubbles: true, composed: true}));
        
    }    

}

customElements.define(DaPlayer.is, DaPlayer);