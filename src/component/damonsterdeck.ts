'use strict';

import DaMonsterCard from './damonstercard.js'
import {DaCardEvents} from  './damonstercard.js'

export enum DeckServeDirection{
    Up,
    DownAndFlip,
    Flip
}

export enum DaDeckEvents {
    Draw = 'draw-from-deck'
}


export default class DaMonsterDeck extends HTMLElement {        
    public static get is(): string { return 'da-monster-deck'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-monster-deck-container{
                    position: relative;
                    padding: 15px 0;  /*for the moving...*/                                        
                }
                
                #card-container{
                    position: relative;
                    height: 80px;
                }
                
                #card-container da-monster-card{
                    position: absolute;                    
                }
                                                

                @media only screen and (min-width: 500px) {
                }
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-monster-deck-container">                            
                <div id="card-container">                
                </div>
                <div id="available-monster-container">
                </div>
            </div>
        `;
    }

    public static get properties() {
        return {
        };
    }

    public static get observedAttributes(): string[] {

        const attributes: string[] = [];

        for (let key in DaMonsterDeck.properties) {
            attributes.push(key.toLowerCase());
        }

        return attributes;
    }

    private props: any = {};

    public constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        
        // Initialize declared properties
        for (let key in DaMonsterDeck.properties) {
            this.props[key] = DaMonsterDeck.properties[key].value;
        }

        this.requestRender();
         
        let container = this.shadowRoot.getElementById('card-container'),
            daCard = new DaMonsterCard();
        container.appendChild(daCard);
        
        daCard.addEventListener(DaCardEvents.Clicked,(e) => {
            this.dispatchEvent(new CustomEvent(DaDeckEvents.Draw, {detail: null, bubbles: true, composed: true}));
        });                
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
    
    
    //--------------------------------------------------//                    
    public Serve(id, point, cardType, heroType, action, direction){                        
        let cardContainer = this.shadowRoot.getElementById('card-container'),
            daCard = new DaMonsterCard();
                        
        cardContainer.appendChild(daCard);
        daCard.Set(id, point, cardType, heroType, action)
                                                        
        
        return new Promise((resolve, reject)=>{            
            setTimeout(()=>{                   
                let promises = [];                             
                if (direction == DeckServeDirection.Flip || direction == DeckServeDirection.DownAndFlip){
                    promises.push(
                        daCard.flip(direction)
                    );
                }
        
                if (direction != DeckServeDirection.Flip){
                    promises.push(
                        new Promise((resolve, reject) =>{                                
                            let animation = daCard.animate(
                                [   {'top': 0}, 
                                    {'top': direction == DeckServeDirection.Up ? '-15px' : '15px'}
                                ], 
                                {   duration: 500, 
                                    iterations: 1,
                                    //startDelay: 1000
                                    //endDelay: 100
                                }
                            );
                            animation.onfinish = (e) =>{
                                resolve();                        
                            };
                        })
                    );
                }                
                                
                Promise.all(promises).then(() =>{
                    if (direction != DeckServeDirection.Flip){
                        cardContainer.removeChild(daCard);
                    }                    
                    resolve(daCard);
                })                        
            }, 100);
        });                                             
    }
    
    public RemoveTop(){
        let cardContainer = this.shadowRoot.getElementById('card-container');
        
        cardContainer.removeChild(cardContainer.lastChild);
        
        return Promise.resolve();        
        // while (cardContainer.firstChild) {
        //         cardContainer.removeChild(cardContainer.firstChild);
        //     }                    
    }
    
    public AddAVailableMonster(id, point){
        let cardContainer = this.shadowRoot.getElementById('card-container'),        
            monsterContainer =  this.shadowRoot.getElementById('available-monster-container'),
            daCard = cardContainer.lastChild;
        
        cardContainer.removeChild(daCard);
        monsterContainer.append(daCard);
        
        return Promise.resolve();                
    }
}

customElements.define(DaMonsterDeck.is, DaMonsterDeck);