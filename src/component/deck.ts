'use strict';
import { ICard_com_data } from './idamonster'
import Card_com, { Card_com_events } from './card'
import { resolve } from 'dns';

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
                    transition: margin-top .2s ease-in;
                    margin-top: 0;
                    -webkit-transition: all .4s ease-in-out;
                    transition: all .4s ease-in-out;
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
                    <da-card last-card></da-card>                
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

        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        template.innerHTML = this.getTemplate({});
        this.shadowRoot!.appendChild(template.content.cloneNode(true));

        let daCard = this.shadowRoot!.querySelector('[last-card]') as Card_com;
        daCard.addEventListener(Card_com_events.clicked, (e) => {
            this.dispatchEvent(new CustomEvent(Deck_com_events.Draw, { detail: null, bubbles: true, composed: true }));
        });
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string, namespace: string): void {
        if (oldValue === newValue) {
            return;
        }
        this.props[name] = newValue;
    }

    //--------------------------------------------------//
    public Serve(id: any, point: any, cardType: any, heroType: any, action: any, direction: any): Promise<Card_com> {
        let cardContainer = this.shadowRoot!.getElementById('card-container'),
            daCard = new Card_com();
        daCard.set({ id: id, cardType: cardType, heroType: heroType, action: action, point: point });
        daCard.isFlip = false;
        daCard.setAttribute('with-animation', '');
        cardContainer!.appendChild(daCard);

        return new Promise(resolve => {
            //has to be 50 delay to kick off the animation...
            setTimeout(() => {
                const waitTime = 500,
                    promises = [];

                promises.push(new Promise(resolve => {
                    const callback = () => {
                        daCard.removeEventListener(Card_com_events.onAnimationDone, callback);
                        resolve();
                    }
                    daCard.addEventListener(Card_com_events.onAnimationDone, callback);
                    daCard.setAttribute('card-size', 'large');
                }));

                switch (direction) {
                    case Deck_com_serve_direction.Flip:
                        promises.push(daCard.flip());
                        return Promise.all(promises).then(() => { return resolve(daCard) });
                    case Deck_com_serve_direction.Up:
                        return Promise.all(promises).then(() => {               
                            setTimeout(() => {
                                const callback = (e: any) => {
                                    daCard.removeEventListener('webkitTransitionEnd', callback);
                                    resolve(daCard);
                                };
                                daCard.addEventListener('webkitTransitionEnd', callback);
                                daCard.classList.add('serveUp');
                            }, waitTime);
                        });
                    case Deck_com_serve_direction.DownAndFlip:
                        promises.push(daCard.flip());
                        return Promise.all(promises).then(() => {
                            setTimeout(() => {
                                const callback = (e: any) => {
                                    daCard.removeEventListener('webkitTransitionEnd', callback);
                                    resolve(daCard);
                                };
                                daCard.addEventListener('webkitTransitionEnd', callback);
                                daCard.classList.add('serveDown');
                            }, waitTime)
                        });
                }
            }, 50);
        })
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