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
                <button id="playBtn">PLAY</button>
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
    private selectedCards = [];     

    public constructor() {
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        for (let key in DaPlayer.properties) {
            this.props[key] = DaPlayer.properties[key].value;
        }                                

        this.requestRender();

        this.shadowRoot.getElementById('playBtn').onclick = this.play;
        
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
            this.shadowRoot.getElementById('hero-context').innerHTML = newValue;
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
    
    
    private play(e){
        console.log('play pressed %o' + e);
    }
    
    private toggleCard(card, isSelected){
        console.log('%o toggle selection "%s"', card, isSelected);
        
        if (isSelected){
            this.selectedCards.push(card);            
        }else{
            this.selectedCards.splice(this.selectedCards.findIndex((c) => {
                return c === card;
            }), 1);
        }
        
        if (this.selectedCards.length == 0){
            let playBtn = this.shadowRoot.getElementById('playBtn'); 
            playBtn.innerHTML = 'Draw from deck';
            playBtn.onclick = (e) =>{
                this.shadowRoot.dispatchEvent(new CustomEvent('draw-from-deck', {bubbles: true, composed: true}));
            }
        }
    }
    
    // selectTab() {
    //     const tabs = this.shadowRoot.querySelector('#tabs');
    //     //composed default is false and it wont bubble top outside shadow DOM        
    //     tabs.dispatchEvent(new Event('tab-select', {bubbles: true, composed: true}));        
    // }
}

customElements.define(DaPlayer.is, DaPlayer);