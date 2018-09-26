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
                #da-hero-container.k #hero-context{
                    background-image: url(images/knight.png);
                }
                #da-hero-container.w #hero-context{
                    background-image: url(images/wizard.png);
                }
                #da-hero-container.r #hero-context{
                    background-image: url(images/ranger.png);
                }
                #da-hero-container #da-hero-type-icon{
                    width: 15px;
                    height: 15px;                    
                    background-repeat: no-repeat;
                    background-size: contain;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                }
                #da-hero-container.k #da-hero-type-icon{
                    background-image: url(images/swordIcon_black.png);
                }
                #da-hero-container.w #da-hero-type-icon{
                    background-image: url(images/staffIcon_black.png);
                }
                #da-hero-container.r #da-hero-type-icon{
                    background-image: url(images/arrowIcon_black.png);
                }
                
                #items-container #items-context div{                
                    width: 50px;
                    height: 50px;
                    background-image: url(images/swordicon_black.png);
                    background-size: contain;
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
                    font-size: 1em;                    
                }
                #point-container #point-context{
                    text-align: center;
                    padding-top: 3px;
                }
                
                #items-container{
                    position: absolute;
                    top: 50px;
                    left: 150px;                    
                }
                
                
                #da-button-bar{
                    height: 25px;
                }
                #da-button-bar button:disabled{
                    display: none;
                }
                
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-player-container">                                                         
                <div id="da-hero-container">
                    <div id="da-hero-type-icon"></div>                
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
                let id = daCard.getAttribute('id');                
                    if (hand.cards.every((c) => {
                        return id != 'id'+c.id;
                    })){
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
            let hero = JSON.parse(newValue);
            if (hero.card){                                           
                this.shadowRoot.getElementById('da-hero-container').classList.add(hero.card.heroType);                                
            }
        }
        
        if (name === 'data-point' && newValue){
            this.shadowRoot.getElementById('point-context').innerHTML = newValue;
        }
        
        if (name === 'data-hero-items' && newValue){
            let data = JSON.parse(newValue);           
            if (data.items) {            
                //remove discarded card
                Array.from(this.shadowRoot.getElementById('items-context').children).forEach((item) => {
                    let id = item.getAttribute('id');
                    if (data.items.every((i) => {
                        return id != 'id' + i.id;
                    })) {
                        item.remove();
                    }
                });
            
                //add new card
                data.items.forEach((i) => {
                    let existingCard = this.shadowRoot.getElementById('items-context').querySelector('#id' + i.id);
                    if (!existingCard) {
                        let card = '<div id="' + i.id + '">' + i.point + '</div>';
                        this.shadowRoot.getElementById('items-context').innerHTML += card;
                    }
                })
            }else{
                this.shadowRoot.getElementById('items-context').innerHTML = ''                
            }                                                 
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