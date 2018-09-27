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
                    margin-bottom: 5px;
                }
                #da-menu-container{
                    position: relative;
                    margin-bottom: 5px;                                        
                }                
                
                #hand-context{
                    display: flex;
                    flex-wrap: wrap;                
                }                   
                
                #da-hero-container{
                    position: relative;
                }               
                
                #hero-context{
                    width: 50px;
                    height: 50px;                    
                    margin-left: 10px;
                    margin-right: 15px;
                    background-size: contain;
                    background-repeat: no-repeat;  
                    background-position-y: bottom;
                    background-image: url(images/none.png);
                    background-color: #aaa;
                    border-radius: 25px;
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
                    width: 25px;
                    height: 25px;                    
                    background-repeat: no-repeat;
                    /*background-size: contain;*/
                    position: absolute;
                    bottom: 0;
                    left: 50px;
                    background-color: #aaa;
                    border-radius: 13px;
                    background-size: 70%;
                    background-position: 2px 4px;
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
                                                
                #point-container{
                    position: absolute;
                    top: 0px;
                    left: 0px;
                    height: 20px;
                    width: 20px;
                    border-radius: 10px;
                    background-color: #aaa;
                    color: white;
                    font-size: 10pt;                    
                }
                #point-container.hidden{
                    display: none;
                }
                #point-container #point-context{
                    text-align: center;
                    padding-top: 3px;
                }
                
                #items-container{
                    position: absolute;
                    bottom: 0px;
                    left: 85px;                    
                }
                #items-container #items-context{
                    display: flex;
                }
                
                #items-container #items-context div{                
                    width: 25px;
                    height: 25px;
                    background-image: url(images/swordicon_black.png);
                    background-size: contain;
                    background-repeat: no-repeat;
                    margin-right: 5px;
                }
                
                #da-monster-kill-container{
                    position: absolute;
                    right: 0;
                    top: 0;
                }
                
                #da-monster-kill-container #monster-context div{
                    width: 20px;
                    height: 20px;
                    background-image: url(images/monster_die.png);
                    background-size: contain;
                    background-repeat: no-repeat;
                    margin-right: 5px;
                }                                                                
                
                #da-button-bar{
                    height: 25px;
                }
                #da-button-bar.hidden{
                    display: none;
                }
                #da-button-bar button:disabled{
                    display: none;
                }
                
                
                @media only screen and (max-width: 500px) {                
                }

                
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-player-container">
                <div id="da-menu-container">                                                         
                    <div id="da-hero-container">
                        <div id="da-hero-type-icon"></div>                
                        <div id="hero-context"></div>                                                            
    
                        <div id="point-container">
                            <div id="point-context"></div>
                        </div>
                    </div>
                    
                    <div id="items-container">
                        <div id="items-context"></div>
                    </div>
                                                                                    
                    <div id="da-monster-kill-container">
                        <div id="monster-context"></div>
                    </div>                    
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
    private isNPC:boolean = false;   

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
    
    public setNPC(){
        this.isNPC = true;
        this.shadowRoot.getElementById('da-button-bar').classList.add('hidden');
    }
    
    public getHandIds(){
        return Array.from(this.shadowRoot.getElementById('hand-context').children).map((n) =>{
            return parseInt(n.getAttribute('id').substring(2));
        })
    }
    public addHand(card){
        let handContext = this.shadowRoot.getElementById('hand-context'), 
            daCard = new DaCard();
        if (this.isNPC){
            daCard.showBack();
        }
                
        daCard.setAttribute('id', 'id'+card.id);
        daCard.setAttribute('data-id', card.id);                
        if (card.point){
            daCard.setAttribute('data-point', card.point);
        }
        daCard.setAttribute('data-card-type', card.type);
        switch (card.type){
            case 'h':
            case 'i':
            daCard.setAttribute('data-hero', card.heroType);
            break;
            case 'a':
                daCard.setAttribute('data-action', card.action)
                break;    
        }                           
        daCard.addEventListener('card-toggle', (e)=>{
            this.toggleCard(e.currentTarget, e.detail);
        });
        
        handContext.appendChild(daCard);
        
        if (this.isNPC){
            this.setCardHidden();        
        }             
    }
    public removeHand(id){
        let existingCard = this.shadowRoot.getElementById('hand-context').querySelector('#id' + id);
        if (existingCard){
            existingCard.remove();
        }
        
        if(this.isNPC){
            this.setCardHidden();
        }
    }
    private setCardHidden(){
        if (!this.isNPC){
            return;
        }
        
        let handContext = this.shadowRoot.getElementById('hand-context'),
            cards = Array.from(this.shadowRoot.getElementById('hand-context').children);
        
        if (cards.length < 1){
            return
        }
        
        let cardWidth = cards[0].offsetWidth,
            maxNumberOfCards = Math.floor(this.offsetWidth / cardWidth) - 1;
            
        cards.forEach((c, index) =>{
            if (index < maxNumberOfCards){
                cards[index].show();
            }else{
                cards[index].hide();
            }
        });
        if (cards.length > maxNumberOfCards){
            //add ...
        }                                
    }
    
    
    public setHero(hero){
        this.shadowRoot.getElementById('da-hero-container').classList.remove('k', 'w', 'r');
        if (hero){
            this.shadowRoot.getElementById('da-hero-container').classList.add(hero.heroType);                        
        }        
    }    
    
    public addItem(item){
        let card =  document.createElement('div');
        card.setAttribute('id', 'id'+item.id);
        card.innerHTML = item.point;
        this.shadowRoot.getElementById('items-context').append(card);
    }
    
    public removeItem(item){
        let existingCard = this.shadowRoot.getElementById('items-context').querySelector('#id' + item.id);
        if (existingCard){
            existingCard.remove();
        }        
    }
    public removeAllItems(){
        Array.from(this.shadowRoot.getElementById('items-context').children).forEach((n) =>{
            n.remove();
        });
    }    
    public getItemIds(){
        return Array.from(this.shadowRoot.getElementById('items-context').children).map((n) =>{
            return parseInt(n.getAttribute('id').substring(2));
        })
    }
    
    public setPoint(point){
        this.shadowRoot.getElementById('point-context').innerHTML = point;
    }
    
    public addMonsterKilled(id){
        let card = document.createElement('div');
        card.setAttribute('id', id);                        
        this.shadowRoot.getElementById('monster-context').append(card);
    }
    
    public monsterInvade(isInvade){
        let readyBtn = this.shadowRoot.getElementById('readyBattleBtn');
        if (isInvade){                
            readyBtn.removeAttribute('disabled');
        }else{
            readyBtn.setAttribute('disabled', true);                
        }            
    }

}

customElements.define(DaPlayer.is, DaPlayer);