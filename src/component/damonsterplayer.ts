'use strict';

import DaMonsterCard from './damonstercard.js'

export default class DaMonsterPlayer extends HTMLElement {
    public static get is(): string { return 'da-monster-player'; }

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
                    <button id="actionBtn">Draw from deck</button>            
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
            'data-is-active': {
                type: String,
                value: ''
            }
        };
    }
   
    public static get observedAttributes(): string[] {
        
        const attributes: string[] = [];

        for (let key in DaMonsterPlayer.properties) {
            attributes.push(key.toLowerCase());
        }

        if (name === 'data-is-active' && newValue) {
            if (newValue = 'true'){
                console.log('turn changed');
            }
        }
        
        return attributes;
    }

    private props: any = {};
    private currentRound = {
        'mode': 'draw',
        'cardType': undefined,
        'cardId': undefined,
        'actionNumber': undefined,
        'args': undefined
    };
    private isNPC:boolean = false;   

    public constructor() {
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        for (let key in DaMonsterPlayer.properties) {
            this.props[key] = DaMonsterPlayer.properties[key].value;
        }                                

        this.requestRender();                                
                
        this.shadowRoot.getElementById('actionBtn').onclick = (e) =>{
            
            e.currentTarget.innerHTML = 'Draw from deck';
                        
            //have to reset this before dispatch event because event may fire and change the mode and btn innerHTML....
            let round = { ...this.currentRound},
                detail = {
                    isNPC: this.isNPC,
                    action: undefined,
                    cardId: round.cardId,                
                    args: round.args                    
                }
            
            //reset            
            this.currentRound.mode = 'draw';
            this.currentRound.cardId = undefined;
            this.currentRound.cardType = undefined;
            this.currentRound.actionNumber = undefined;
            this.currentRound.args = undefined; 
            
            switch(round.mode){
                case 'draw':
                        //play an action (action can be equip or set hero)
                        //check for action if need additional card

                        switch (round.cardType){
                            case 'h':
                                detail.action = 'set-hero';
                                this.dispatchEvent(new CustomEvent('play-card', {detail: detail, bubbles: true, composed: true}));                                                                                                                                              
                            break;
                            
                            case 'i':
                                detail.action = 'equip-hero';                                
                                this.dispatchEvent(new CustomEvent('play-card', {detail: detail, bubbles: true, composed: true}));                                                                                                                                                                                                           
                            break;
                            
                            case 'a':
                                switch(round.actionNumber){
                                    case '5':       //provoke
                                        this.dispatchEvent(new CustomEvent('provoke-arg', {detail: detail, bubbles: true, composed: true}));
                                    break;
                                    
                                    default:
                                    //wait for response...
                                        detail.action = 'play-action'
                                        e.currentTarget.innerHTML = 'WAIT!!!';                                                                                                    
                                        this.dispatchEvent(new CustomEvent('play-card', {detail: detail, bubbles: true, composed: true}));
                                    break;                                 
                                }                                                                
                            break;
                            
                            case undefined:
                                this.dispatchEvent(new CustomEvent('draw-from-deck', {bubbles: true, composed: true}));
                            break;                            
                        }                        
                break;        
                                                                        
                case 'action':
                    if (!round.cardType){
                        //skip and done action
                        this.dispatchEvent(new CustomEvent('skip-action', {bubbles: true, composed: true}));
                    }else{
                        //play an action (stop or defense action only)
                        detail.action = 'play-action';
                        
                        //wait for response...
                        e.currentTarget.innerHTML = 'WAIT!!!';
                                                
                        this.dispatchEvent(new CustomEvent('play-card', {detail: detail, bubbles: true, composed: true})); 
                        
                                                                                                                                            
                    }
                    
                break;                                 
            }

            //reset
                        
        }
        
    }
    
    public attributeChangedCallback(name: string, oldValue: string, newValue: string, namespace: string): void {
        if (oldValue === newValue) {
            return;
        }

        this.props[name] = newValue;
        
        if (name === 'data-is-active' && newValue) {
        }                                                    
    }
        
    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        
        template.innerHTML = this.getTemplate({});
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
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
                    this.currentRound.cardType = cardType;
                    this.currentRound.cardId = cardId;
                    break;
                
                case 'i':
                    actionBtn.innerHTML = 'Equip Hero';
                    this.currentRound.cardType = cardType;
                    this.currentRound.cardId = cardId;
                    break;
                
                case 'a':
                    actionBtn.innerHTML = 'Play Action';
                    this.currentRound.cardType = cardType;
                    this.currentRound.cardId = cardId;
                    this.currentRound.actionNumber = card.getAttribute('data-action');                    
                    break;
            
            }    
        }else{
            this.currentRound.cardType = undefined;
            this.currentRound.cardId = undefined;
            if (this.currentRound.mode == 'draw'){
                actionBtn.innerHTML = 'Draw from deck';
            }else{
                actionBtn.innerHTML = 'Skip';                
            }            
        }
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
            daMonsterCard = new DaMonsterCard();
        if (this.isNPC){
            //daMonsterCard.showBack();
        }
                
        daMonsterCard.setAttribute('id', 'id'+card.id);
        daMonsterCard.setAttribute('data-id', card.id);                
        if (card.point){
            daMonsterCard.setAttribute('data-point', card.point);
        }
        daMonsterCard.setAttribute('data-card-type', card.type);
        switch (card.type){
            case 'h':
            case 'i':
            daMonsterCard.setAttribute('data-hero', card.heroType);
            break;
            case 'a':
                daMonsterCard.setAttribute('data-action', card.action)
                break;    
        }                           
        daMonsterCard.addEventListener('card-toggle', (e)=>{
            this.toggleCard(e.currentTarget, e.detail);
        });
        
        handContext.appendChild(daMonsterCard);
        
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
        
        return;
        
        if (!this.isNPC){
            return;
        }
        
        let handContext = this.shadowRoot.getElementById('hand-context'),
            cards = Array.from(this.shadowRoot.getElementById('hand-context').children);
        
        if (cards.length < 1){
            return
        }
        
        let cardWidth = cards[0].offsetWidth,
            maxNumberOfCards = Math.floor(document.body.offsetWidth / cardWidth) - 1;
            
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
    
    public startAction(){
        if (!this.isNPC){
            this.currentRound.mode = 'action';
            let actionBtn = this.shadowRoot.getElementById('actionBtn');     
            actionBtn.innerHTML = 'Skip';
        }else{
            setTimeout(() =>{
                this.dispatchEvent(new CustomEvent('react-action', {bubbles: true, composed: true}));    
            }, 500);
        }   
    }  
    
    public endAction(){
        this.currentRound.mode = 'draw';
        let actionBtn = this.shadowRoot.getElementById('actionBtn');     
        actionBtn.innerHTML = 'Draw from deck';        
    } 
    
    public pickAvailableMonster(){
        let promise = new Promise((resolve, reject)=>{
            
            
            
        })
    } 
}

customElements.define(DaMonsterPlayer.is, DaMonsterPlayer);