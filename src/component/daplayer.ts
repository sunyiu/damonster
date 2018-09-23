'use strict';

import DaCard from './dacard.js'

export default class DaPlayer extends HTMLElement {
    public static get is(): string { return 'da-player'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-player-container{
                    font-size: 0.5em;
                    padding-bottom: 15px;
                }
                .container{
                    padding-bottom: 10px;
                }
                button{
                    display: inline-block;
                }
                button:disabled{
                    display: none;
                }
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-player-container">
                <div id="da-hero-container" class="container">
                    <div><strong>HERO</strong>&nbsp;&nbsp;<span id="point-context"></span></div>
                    <div>
                        <span id="hero-context"></span>
                        <span>&nbsp;</span>
                        <span id="hero-item-context"></span>
                    </div>
                </div>            
                <div id="da-hand-container" class="container">
                    <div><strong>HAND</strong></div>
                    <div id="hand-context"></div>
                </div>
                <div id="da-monster-kill-container" class="container">
                    <div><strong>Killed</strong></div>
                    <div id="monster-context"></div>
                </div>
                <button id="playBtn">Draw from deck</button>
                <button id="actionBtn" disabled>Play selected</button>
                <button id="readyBattle" disabled></button>
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
            this.playAction(this.currentAction);
        }
        
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
                    card.setAttribute('data-card-type', 'card-' + c.type);                    
                    card.setAttribute('data-hero-type', 'hero-' + c.heroType);       
                    card.addEventListener('card-toggle', (e)=>{
                        this.toggleCard(e.currentTarget, e.detail);
                    });
                    this.shadowRoot.getElementById('hand-context').appendChild(card);
                }
            })
            
                                               
        }
        
        if (name === 'data-hero' && newValue){
            if (newValue == 'none'){
                Array.from(this.shadowRoot.getElementById('hero-context').children).forEach((c) =>{
                    c.remove();
                });
            }else{                           
                let hero = JSON.parse(newValue),
                    daHeroCard = new DaCard();
                daHeroCard.setAttribute('id', 'id', hero.card.id);
                daHeroCard.setAttribute('data-id', hero.card.id);                
                daHeroCard.setAttribute('data-point', hero.card.point);
                daHeroCard.setAttribute('data-card-type', 'card-' + hero.card.type);                    
                daHeroCard.setAttribute('data-hero-type', 'hero-' + hero.card.heroType);       
                
                this.shadowRoot.getElementById('hero-context').appendChild(daHeroCard);
            }
        }
        
        if (name === 'data-point' && newValue){
            this.shadowRoot.getElementById('point-context').innerHTML = newValue;
        }
        
        if (name === 'data-hero-items' && newValue){
            this.shadowRoot.getElementById('hero-item-context').innerHTML = newValue;
        }
        
        if (name === 'data-monster-killed' && newValue){
            this.shadowRoot.getElementById('monster-context').innerHTML = newValue;
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
    
    private playSelectedCard(){
        
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
                case 'card-h':
                    actionBtn.innerHTML = 'Set Hero';
                    this.currentAction = {
                        name: 'set-hero',
                        cardId: cardId 
                    };
                    break;
                
                case 'card-i':
                    actionBtn.innerHTML = 'Equip Hero';
                    this.currentAction = {
                        name: 'equip-hero',
                        cardId: cardId
                    };
                    break;
                
                case 'card-a':
                    actionBtn.innerHTML = 'Play Action';
                    this.currentAction = {
                        name: 'play-action',
                        cardId: cardId
                    }
                    break;
            
            }
            actionBtn.removeAttribute('disabled');     
        }else{
            actionBtn.setAttribute('disabled', 'true');
        }
    }   
    
    private playAction(action){        
        this.dispatchEvent(new CustomEvent('play-action', {detail: this.currentAction, bubbles: true, composed: true}));
    }    
    
    // selectTab() {
    //     const tabs = this.shadowRoot.querySelector('#tabs');
    //     //composed default is false and it wont bubble top outside shadow DOM        
    //     tabs.dispatchEvent(new Event('tab-select', {bubbles: true, composed: true}));        
    // }
}

customElements.define(DaPlayer.is, DaPlayer);