'use strict';
import { ICard_com_data} from './idamonster'
import Card_com, { Card_com_events } from './card'

export enum Deck_com_serve_direction {
    Up,
    DownAndFlip,
    Flip
}

export enum Deck_com_events {
    Draw = 'draw-from-deck'
}

export default class Deck_com extends HTMLElement {
    public static get is(): string { return 'da-monster-deck'; }

    public getTemplate(props: any): string {
        return `
            <style>
                da-card{
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: perspective(1px) translateX(-50%) translateY(-50%);
                    transition: margin-top .5s ease-in;
                    margin-top: 0;
                }
                da-card.serveUp{
                    margin-top: -25px;
                }
                da-card.serveDown{
                    margin-top: 25px;
                }

                #da-monster-deck-container{
                    position: relative;
                    height: 100%;                                     
                }
                
                #card-container{
                    position: relative;
                    height: 100%;
                    overflow: hidden;
                }
                
                #card-container da-monster-card{
                    display: inline-block;
                    position: absolute;
                    top: 0;
                    left: 0;                    
                }
                #card-container da-monster-card:first-child{
                    position: relative;
                }
                
                #available-monster-container{
                    position: absolute;
                    right: 0;
                    top: 0;
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

    // public static get properties() {
    //     return {
    //     };
    // }

    // public static get observedAttributes(): string[] {
    //     const attributes: string[] = [];
    //     for (let key in Deck_com.properties) {
    //         attributes.push(key.toLowerCase());
    //     }
    //     return attributes;
    // }

    private props: any = {};

    public constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        // Initialize declared properties
        // for (let key in Deck_com.properties) {
        //     this.props[key] = Deck_com.properties[key].value;
        // }

        this.requestRender();

        let container = this.shadowRoot!.getElementById('card-container'),
            daCard = new Card_com();
        container!.appendChild(daCard);

        daCard.addEventListener(Card_com_events.Clicked, (e) => {
            this.dispatchEvent(new CustomEvent(Deck_com_events.Draw, { detail: null, bubbles: true, composed: true }));
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

        this.shadowRoot!.appendChild(template.content.cloneNode(true));
    }


    //--------------------------------------------------//                    
    public Serve(id: any, point: any, cardType: any, heroType: any, action: any, direction: any): Promise<Card_com> {
        let cardContainer = this.shadowRoot!.getElementById('card-container'),
            daCard = new Card_com();

        cardContainer!.appendChild(daCard);
        daCard.set({ id: id, cardType: cardType, heroType: heroType, action: action, point: point });
        daCard.isFlip = false;

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let promises = [];
                if (direction == Deck_com_serve_direction.Flip || direction == Deck_com_serve_direction.DownAndFlip) {
                    promises.push(
                        daCard.flip()
                    );
                }

                if (direction != Deck_com_serve_direction.Flip) {

                    promises.push(new Promise((resolve, reject) => {
                        const callback = (e: any) => {
                               daCard.removeEventListener('webkitTransitionEnd', callback);
                                resolve();
                            }
                        daCard.addEventListener('webkitTransitionEnd', callback);
                        daCard.classList.add(direction == Deck_com_serve_direction.Up ? 'serveUp' : 'serveDown');
                    }));
                }

                Promise.all(promises).then(() => {
                    if (direction != Deck_com_serve_direction.Flip) {
                        cardContainer!.removeChild(daCard);
                    }
                    resolve(daCard);
                })
            }, 100);
        });
    }

    public RemoveTop() {
        console.log('remove top');
        let cardContainer = this.shadowRoot!.getElementById('card-container');
        cardContainer!.removeChild(cardContainer!.lastChild as Node);

        return Promise.resolve();
        // while (cardContainer.firstChild) {
        //         cardContainer.removeChild(cardContainer.firstChild);
        //     }                    
    }

    public AddAVailableMonster(id: any, point: any) {
        let cardContainer = this.shadowRoot!.getElementById('card-container'),
            monsterContainer = this.shadowRoot!.getElementById('available-monster-container'),
            daCard = cardContainer!.lastChild as Node;

        cardContainer!.removeChild(daCard);
        monsterContainer!.append(daCard);

        return Promise.resolve();
    }

    public ShowNCard(cardIds: number[]) {
        console.log('com::Deck ShowNCards %o', cardIds);
        return Promise.resolve();
    }
}

customElements.define(Deck_com.is, Deck_com);