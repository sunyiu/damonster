'use strict';

import DaMonsterCard from './card.js'
import {DaCardEvents} from './card.js'
import Playerhero_com from './playerhero.js'

export enum Player_com_events {
    SetHero = 'set-hero',
    EquipHero = 'equip-hero',
    DoAction = 'do-action',
    SkipAction = 'action-done',
    DoBattle = 'do-battle'
}

export default class Player_com extends HTMLElement {
    public static get is(): string { return 'da-monster-player'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-player-container{
                    position: relative;
                }

                #hand-container{
                    display: flex;
                    overflow: auto;
                }

                @media only screen and (max-width: 500px) {
                }
                
                
                button.hide{
                    display: none;
                }
                
                #monster-container div.monster{
                    display: block;
                    width: 60px;
                    height: 60px;
                    background-size: contain;
                    background-image: url(images/monster.png);
                    background-repeat: no-repeat;
                }
                


			</style>
            <!-- shadow DOM for your element -->
			<div id="da-player-container">
                <div id="hand-container"></div>
                <div id="monster-container"></div>
                <div id="btns">
                    <button id="playBtn" class="hide">PLAY</button>
                    <button id="battleBtn" class="hide">FIGHT</button>
                    <button id="actionBtn" class="hide">DONE</button>
                </div>
            </div>
        `;
    }

    public static get properties() {
        return {
            'data-type': {
                type: String,
                value: ''
            }
        };
    }

    public static get observedAttributes(): string[] {

        const attributes: string[] = [];

        for (let key in Player_com.properties) {
            attributes.push(key.toLowerCase());
        }

        return attributes;
    }

    private props: any = {};

    public constructor() {
        super();        

        this.attachShadow({ mode: 'open' });
        
        // Initialize declared properties
        for (let key in Player_com.properties) {
            this.props[key] = Player_com.properties[key].value;
        }

        this.requestRender();
        
        let container = this.shadowRoot.getElementById('da-player-container');
        this._hero = new Playerhero_com();
        container.insertBefore(this._hero, container.firstChild);        
    }
        
    public attributeChangedCallback(name: string, oldValue: string, newValue: string, namespace: string): void {
        if (oldValue === newValue) {
            return;
        }
        
        this.props[name] = newValue;
        
        if(name === 'data-type'){
            if(newValue && newValue){
                if (newValue == 'npc'){
                    this._isNPC = true;
                    let container = this.shadowRoot.getElementById('da-player-container');
                    container.removeChild(this.shadowRoot.getElementById('btns'));
                }
                else{
                    this._isNPC = false;
                    this.shadowRoot.getElementById('playBtn').onclick = (e) => {
                    let container = this.shadowRoot.getElementById('hand-container'),
                        card = Array.from(container.children).find((c) =>{
                            return c.isSelected;
                        });
                    
                    if (!card){
                        console.log('NOTHING is selected!!!!');
                        return;
                    }
                    
                    switch (card.cardType) {
                        case 'h':
                            this.dispatchEvent(new CustomEvent(Player_com_events.SetHero, { detail: {card: card}, bubbles: true, composed: true }));
                            break;
                    
                        case 'a':
                            this.dispatchEvent(new CustomEvent(Player_com_events.DoAction, { detail: {card: card}, bubbles: true, composed: true }));
                            break;
                    
                        case 'i':
                            this.dispatchEvent(new CustomEvent(Player_com_events.EquipHero, { detail: {card: card}, bubbles: true, composed: true }));
                            break;
                    }
                        //hide the play button
                        e.srcElement.classList.add('hide');
                    }    
            
                    this.shadowRoot.getElementById('battleBtn').onclick = (e) =>{
                        this.dispatchEvent(new CustomEvent(Player_com_events.DoBattle, {detail: null, bubbles: true, composed: true}));
                        e.srcElement.classList.add('hide');
                    }
                    
                    this.shadowRoot.getElementById('actionBtn').onclick = (e) =>{
                        this.dispatchEvent(new CustomEvent(Player_com_events.SkipAction, {detail: null, bubbles: true, composed: true}));
                        e.srcElement.classList.add('hide');            
                    }                     
                }
            }                        
        }
    }

    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');

        template.innerHTML = this.getTemplate({});

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    
    //------------------------------------------------------------//
    // private _action = {
    //     name: Player_com_events.DrawFromDeck,
    //     detail: null
    // };
    
    private _isNPC;
    public get isNPC(){
        return this._isNPC;
    }
    
    private _hero;
    public get hero(){
        return this._hero;
    }
    
    public set isActionOn(value){
        let btn = this.shadowRoot.getElementById('actionBtn');
        if (value){
            btn.classList.remove('hide');
        }else{
            btn.classList.add('hide');
        }
    }
    
    public set isBattleOn(value){
        let btn = this.shadowRoot.getElementById('battleBtn');
        if (value){
            btn.classList.remove('hide');
        }else{
            btn.classList.add('hide');
        }
    }

    private toggleCard(card) {
        //deselect other
        let container = this.shadowRoot.getElementById('hand-container');
        Array.from(container.children).forEach((c) => {
            let id = parseInt(c.getAttribute('data-id'));
            if (id != card.id) {
                c.isSelected = false;
            }else{
                c.isSelected = !c.isSelected;
                let playBtn = this.shadowRoot.getElementById('playBtn');
                if (c.isSelected){
                     playBtn.classList.remove('hide');
                }else{
                    playBtn.classList.add('hide');
                }
            }
        })
    }

    public InitHand(cards) {
        cards.forEach((card) => {
            let container = this.shadowRoot.getElementById('hand-container');
            
            if (!this._isNPC){               
                card.addEventListener(DaCardEvents.Clicked,(e) => {
                    this.toggleCard(card);
                });    
            }
            container.appendChild(card);            
        })
    }
            
    public GetCardById(id){
        let container = this.shadowRoot.getElementById('hand-container');
        return Array.from(container.children).find((c)=>{
            return c.id == id;
        });
    }
    
    public GetHandIds(){
        let container = this.shadowRoot.getElementById('hand-container');
        
        return Array.from(container.children).map((n) =>
            {
                return n.id;
            });
    }

    public AddHand(daCard:DaMonsterCard) {
        let container = this.shadowRoot.getElementById('hand-container');
        container.prepend(daCard); 
        
        return daCard.add().then(() =>{
            if (!this._isNPC){
                daCard.addEventListener(DaCardEvents.Clicked,(e) => {
                    this.toggleCard(daCard);
                });               
            }              
        });                                                 
    }


    public RemoveHand(id) {
        let container = this.shadowRoot.getElementById('hand-container'),
            daCard = Array.from(container.children).find((c) => {
                return c.id == id;
            });
            
        if (!daCard){
            console.log('CARD NOT IN HAND!!!!! cannot remove');
        }
        
        return daCard.remove().then(() =>{
            container.removeChild(daCard);
            return daCard;
        });         
    }   
    
    public EndAction(){
                let playBtn = this.shadowRoot.getElementById('playBtn');
                if (c.isSelected){
                     playBtn.classList.remove('hide');
                }else{
                    playBtn.classList.add('hide');
                }
        
    }
    
    public KillAMonster(){
        let container = this.shadowRoot.getElementById('monster-container'),
            monster = document.createElement('div');
            monster.classList.add('monster');
        container.append(monster);
        return Promise.resolve();
    }
   
    // public EquipHero(point) {
    //     return this._hero.Equip(point);
    // }
    
    // public ShowCard(id){
    //     let container = this.shadowRoot.getElementById('hand-container'),
    //         daCard = Array.from(container.children).find((c) => { return c.id == id;});
    //     if (!daCard){
    //         console.log('CARD NOT IN HAND!!!!');
    //     }
    //     
    //     return daCard.flip();
    //     
    //     // return this._animation = new Promise((resolve, reject) => {
    //     //     //only one direction because it should be called by NPC playing an action
    //     //     return daCard.flip().then(() =>{
    //     //         let animation = daCard.animate(
    //     //             [   {'marginTop': 0}, 
    //     //                 {'marginTop': '15px'}
    //     //             ], 
    //     //             {   duration: 500, 
    //     //                 iterations: 1,
    //     //                 //startDelay: 1000
    //     //                 //endDelay: 500
    //     //             }
    //     //         );                
    //     //         animation.onfinish = (e) =>{
    //     //             resolve();                        
    //     //         };                            
    //     //     });            
    //     // });
    // }    
}

customElements.define(Player_com.is, Player_com);