'use strict';

import Card_com, {Card_com_events} from './card'
import Playerhero_com from './playerhero'
import {Player_com_events} from './events'



export default class Player_com extends HTMLElement {
    public static get is(): string { return 'da-monster-player'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-player-container{
                    display: block;
                    position: relative;
                }
                
                da-monster-player-hero{
                    display: block;
                    padding: 5px;
                    background-color: #33658A;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #e5efff;
                    border-radius: 15px 15px 0 0;
                }
                #da-player-container.npc da-monster-player-hero{
                    background-color: #F26419;       
                    border-bottom: 1px solid #ffe7db;             
                }

                #hand-container{
                    display: flex;
                    flex-wrap: wrap;
                    padding: 5px;                    
                }
                #hand-container, 
                #btns{
                    background-color: #86BBD8;
                }
                #btns{
                    border-radius: 0 0 15px 15px;
                }
                #da-player-container.npc #hand-container{
                    background-color: #a03b04;
                    border-radius: 0 0 15px 15px;                    
                }

                @media only screen and (max-width: 500px) {
                }
                
                
                button.hide{
                    display: none;
                }
                
                
                #monster-container{
                    position: absolute;
                    top: 0;
                    right: 0;
                    display: flex;
                }
                
                #monster-container div.monster{
                    display: block;
                    width: 25px;
                    height: 25px;
                    background-size: contain;
                    background-image: url(images/monster.png);
                    background-repeat: no-repeat;
                }                                                


			</style>
            <!-- shadow DOM for your element -->
			<div id="da-player-container">
                <da-monster-player-hero id="hero"></da-monster-player-hero>
                <div id="monster-container"></div>
                <div id="hand-container"></div>
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

    // public static get observedAttributes(): string[] {
    //     const attributes: string[] = [];
    //     for (let key in Player_com.properties) {
    //         attributes.push(key.toLowerCase());
    //     }
    //     return attributes;
    // }

    //private props: any = {};

    public constructor() {
        super();        

        this.attachShadow({ mode: 'open' });
        
        // Initialize declared properties
        // for (let key in Player_com.properties) {
        //     this.props[key] = Player_com.properties[key].value;
        // }

        this.requestRender();
        
        this._hero = this.shadowRoot!.getElementById('hero') as Playerhero_com;
    }
        
    public attributeChangedCallback(name: string, oldValue: string, newValue: string, namespace: string): void {
        if (oldValue === newValue) {
            return;
        }
        
        //this.props[name] = newValue;
        
        if(name === 'data-type'){
            let container = this.shadowRoot!.getElementById('da-player-container');
            if(newValue){
                if (newValue == 'npc'){
                    this._isNPC = true;
                    container!.classList.add('npc');
                    container!.removeChild((this.shadowRoot!.getElementById('btns') as Node));
                }
                else{
                    this._isNPC = false;
                    container!.classList.remove('npc');                    
                    this.shadowRoot!.getElementById('playBtn')!.onclick = (e) => {
                        let container = this.shadowRoot!.getElementById('hand-container'),
                            card = Array.from(container!.children).find((c: any) =>{
                                return c.isSelected;
                            }) as Card_com;
                        
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
                            (e.srcElement as HTMLElement).classList.add('hide');
                    }    
            
                    this.shadowRoot!.getElementById('battleBtn')!.onclick = (e) =>{
                        this.dispatchEvent(new CustomEvent(Player_com_events.DoBattle, {detail: null, bubbles: true, composed: true}));
                        (e.srcElement as HTMLElement).classList.add('hide');
                    }
                    
                    this.shadowRoot!.getElementById('actionBtn')!.onclick = (e) =>{
                        this.dispatchEvent(new CustomEvent(Player_com_events.SkipAction, {detail: null, bubbles: true, composed: true}));
                        (e.srcElement as HTMLElement).classList.add('hide');            
                    }                     
                }
            }                        
        }
    }

    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');

        template.innerHTML = this.getTemplate({});

        this.shadowRoot!.appendChild(template.content.cloneNode(true));
    }
    
    //------------------------------------------------------------//
    // private _action = {
    //     name: Player_com_events.DrawFromDeck,
    //     detail: null
    // };
    
    private _isNPC: any;
    public get isNPC(){
        return this._isNPC;
    }
    
    private _hero: Playerhero_com;
    public get hero():Playerhero_com{
        return this._hero;
    }
    
    public set isActionOn(value:any){
        let btn = this.shadowRoot!.getElementById('actionBtn');
        if (value){
            btn!.classList.remove('hide');
        }else{
            btn!.classList.add('hide');
        }
    }
    
    public set isBattleOn(value: any){
        let btn = this.shadowRoot!.getElementById('battleBtn');
        if (value){
            btn!.classList.remove('hide');
        }else{
            btn!.classList.add('hide');
        }        
    }

    private toggleCard(card: any) {
        //deselect other
        let container = this.shadowRoot!.getElementById('hand-container');
        Array.from(container!.children).forEach((c) => {
            let id = parseInt(c.getAttribute('data-id') as string);
            if (id != card.id) {
                (c as Card_com).isSelected = false;
            }else{
                (c as Card_com).isSelected = !(c as Card_com).isSelected;
                let playBtn = this.shadowRoot!.getElementById('playBtn');
                if ((c as Card_com).isSelected){
                     playBtn!.classList.remove('hide');
                }else{
                    playBtn!.classList.add('hide');
                }
            }
        })
    }

    InitHand(cards:{id:number, point:number, type:string, heroType: string, action: string, flip: boolean}[]) {
        cards.forEach((c) => {            
            let container = this.shadowRoot!.getElementById('hand-container'),
                card = new Card_com();
                card.Set(c.id, c.point, c.type, c.heroType, c.action, c.flip)
            
            if (!this._isNPC){               
                card.addEventListener(Card_com_events.Clicked,(e) => {
                    this.toggleCard(card);
                });    
            }
            container!.appendChild(card);            
        })
    }
            
    GetCardById(id: number):Card_com{
        let container = this.shadowRoot!.getElementById('hand-container');
        return Array.from(container!.children).find((c)=>{
            return c.id == id.toString();
        }) as Card_com;
    }
    
    public GetHandIds(){
        let container = this.shadowRoot!.getElementById('hand-container');
        
        return Array.from(container!.children).map((n) =>
            {
                return n.id;
            });
    }

    AddHand(daCard:Card_com):Promise<void> {
        let container = this.shadowRoot!.getElementById('hand-container');
        container!.prepend(daCard); 
        
        return daCard.add(!this.isNPC).then(() =>{
            if (!this._isNPC){
                daCard.addEventListener(Card_com_events.Clicked,(e) => {
                    this.toggleCard(daCard);
                });               
            }              
        });                                                 
    }


    RemoveHand(id:number):Promise<void> {
        let container = this.shadowRoot!.getElementById('hand-container'),
            daCard = Array.from(container!.children).find((c) => {
                return c.id == id.toString();
            });
            
        if (!daCard){
            console.log('CARD NOT IN HAND!!!!! cannot remove');
        }
        
        return (daCard as Card_com)!.remove().then(() =>{
            container!.removeChild(daCard as HTMLElement);            
        });         
    }   
    
    public EndAction(){
        // let playBtn = this.shadowRoot!.getElementById('playBtn');
        // if (c.isSelected){
        //         playBtn!.classList.remove('hide');
        // }else{
        //     playBtn!.classList.add('hide');
        // }        
    }
    
    public KillAMonster(){
        let container = this.shadowRoot!.getElementById('monster-container'),
            monster = document.createElement('div');
            monster.classList.add('monster');
        container!.append(monster);
        return Promise.resolve();
    }
   
    // public EquipHero(point) {
    //     return this._hero.Equip(point);
    // }
    
    // public ShowCard(id){
    //     let container = this.shadowRoot!.getElementById('hand-container'),
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