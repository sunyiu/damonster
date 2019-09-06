/*<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
*/

/*<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"/></svg>*/

'use strict';
import { DaHeroTypes, DaActions, DaCardType, ICard_com_data } from './idamonster'
import Card_com from "./card";

const template = document.createElement('template');
template.innerHTML = `
<style>
    #da-hero-container{
        position: relative;
    }

    #hero-item-container{
        position: relative;
        display: flex;
        align-items: center;
    }
    
    #hero-container{
        padding-right: 15px;
    }                
    
    #hero-context{
        width: 60px;
        height: 60px;                    
        background-size: contain;
        background-repeat: no-repeat;  
        background-position-y: bottom;
        background-image: url(images/none.png);
        background-color: #aaa;
        border-radius: 30px;
        border: 1px solid rgba(0,0,0,0);
        
        transition: all .2s ease-in-out;                    
    }
                    
    #hero-container.k #hero-context{
        background-color: rgba(91, 192, 235, 1);
        background-image: url(images/knight.png);
    }
    #hero-container.w #hero-context{
        background-color: rgba(226, 49, 223, 1);
        background-image: url(images/wizard.png);
    }
    #hero-container.r #hero-context{
        background-color: rgba(155, 197, 61, 1);
        background-image: url(images/ranger.png);
    }
    #da-hero-container.active #hero-container #hero-context{
        border: 1px solid black;
    }
    
                                                    
                    
    /*
    #hero-container #da-hero-type-icon{
        width: 25px;
        height: 25px;                    
        background-repeat: no-repeat;
        position: absolute;
        bottom: 0;
        left: 50px;
        background-color: #aaa;
        border-radius: 13px;
        background-size: 70%;
        background-position: 2px 4px;
    }
    #hero-container.k #da-hero-type-icon{
        background-image: url(images/swordIcon_black.png);
    }
    #hero-container.w #da-hero-type-icon{
        background-image: url(images/staffIcon_black.png);
    }
    #hero-container.r #da-hero-type-icon{
        background-image: url(images/arrowIcon_black.png);                    
    }
    */
                                                    
                                                    
    /*@media only screen and (max-width: 500px) {                
    }
                    
    @keyframes setHero {
        0% {
            transform: scale(0.1);
            -webkit-transform: scale(0.1);
        }
        75%{
            transform: scale(1.3);
            -webkit-transform: scale(1.3);            
        }
        100% {
            transform: scale(1.0);
            -webkit-transform: scale(1.0);
        }                    
    }
    @keyframes removeHero{
        0%{
            transform: scale(1.0);
            -webkit-transform: scale(1.0);                        
        }
        15%{
            transform: scale(1.3);
            -webkit-transform: scale(1.3);                        
        }
        100%{
            transform: scale(0.1);
            -webkit-transform: scale(0.1);
            
        }
    }*/
    
    /*
    #da-hero-type-icon{
        animation-duration: 0.5s; 
        animation-timing-function: ease-out; 
        animation-delay: 0s;
        animation-direction: alternate;
        animation-iteration-count: 1;
        animation-fill-mode: none;
        animation-play-state: running; 
    }                        
    
    #da-hero-type-icon.set{
        animation-name: setHero;
    }
    #da-hero-type-icon.remove{
        animation-name: removeHero;
    }
    */
                                                                            
    
    /*
    #da-hero-container.active #hero-container #da-hero-type-icon{
        background-color: black;
        color: white;
    }
    
    #da-hero-container.empty #hero-container #da-hero-type-icon{
        display: none;
    }
    */        
    
    #item-container{
        display: flex;
    }
    
        @keyframes addItem {
        0% {
            transform: scale(0.1);
            -webkit-transform: scale(0.1);
        }
        75%{
            transform: scale(1.3);
            -webkit-transform: scale(1.3);            
        }
        100% {
            transform: scale(1.0);
            -webkit-transform: scale(1.0);
        }                    
    }
    @keyframes removeItem{
        0%{
            transform: scale(1.0);
            -webkit-transform: scale(1.0);                        
        }
        15%{
            transform: scale(1.3);
            -webkit-transform: scale(1.3);                        
        }
        100%{
            transform: scale(0.1);
            -webkit-transform: scale(0.1);
            
        }
    }
    #item-container da-monster-card{
        display: block;
        animation-duration: 0.5s; 
        animation-timing-function: ease-out; 
        animation-delay: 0s;
        animation-direction: alternate;
        animation-iteration-count: 1;
        animation-fill-mode: none;
        animation-play-state: running; 
    }                                        
    #item-container da-monster-card.add{
        animation-name: addItem;                    
    }
    #item-container da-monster-card.remove{
        animation-name: removeItem;                    
    }
    
    
    #star-container{
        position: absolute;
        top: 0;
        left: 45px;
        display: flex;
    }
    #star-container div{
        width: 15px;
        height: 15px;
        fill: rgba(253, 231, 76, 1);                    
    }                                                                                                                   
                                                                                                        
    
</style>
<!-- shadow DOM for your element -->
    <div id="da-hero-container">
        <div id="hero-item-container">
            <div id="hero-container">                                       
                <div id="hero-context"></div>                                                                
            </div>
            <div id="item-container"></div>
        </div>
        <div stars id="star-container"></div>                                        
    </div>
`;

export default class Playerhero_com extends HTMLElement {

    private _shadowRoot: ShadowRoot;
    private _container: HTMLElement;

    public set isActive(value: boolean) {
        if (value) {
            this._container.classList.add('active');
        } else {
            this._container.classList.remove('active');
        }
    }

    public constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._container = this.shadowRoot!.getElementById('da-hero-container') as HTMLElement;
    }

    public attributeChangedCallback(name: string, oldValue: any, newValue: any): void { }

    private addStar() {
        let star = document.createElement('div');
        star.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>';
        const starContainer = this._shadowRoot.querySelector('div[stars]') as HTMLElement;
        starContainer.appendChild(star);
    }


    public equip(cardData:ICard_com_data): Promise<void> {
        let itemContainer = this._shadowRoot.getElementById('item-container') as HTMLElement,
            card = new Card_com();
        card.set(cardData);
        card.isFlip = true;

        return new Promise((resolve, reject) => {
            let callback = (e: any) => {
                card.removeEventListener('webkitAnimationEnd', callback);
                card.classList.remove('add');
                resolve();
            }

            card.addEventListener('webkitAnimationEnd', callback);
            card.isSelected = false;
            card.classList.add('add');
            itemContainer.append(card);
        })
    }

    public empty(): Promise<void> {
        let heroContainer = this.shadowRoot!.getElementById('hero-container') as HTMLElement,
            itemContainer = this.shadowRoot!.getElementById('item-container') as HTMLElement,
            starContainer = this.shadowRoot!.getElementById('star-container') as HTMLElement;

        heroContainer.className = "";
        while (itemContainer.firstChild) {
            itemContainer.removeChild(itemContainer!.firstChild);
        }
        while (starContainer.firstChild) {
            starContainer.removeChild(starContainer!.firstChild);
        }
        return Promise.resolve();
    }

    public set(type: DaHeroTypes, point: number): Promise<void> {
        let heroContainer = this.shadowRoot!.getElementById('hero-container') as HTMLElement
        //itemContainer = this.shadowRoot!.getElementById('item-container'),
        //starContainer = this.shadowRoot!.getElementById('star-container');
        //pointContainer = this.shadowRoot!.getElementById('point-container'),

        this.addStar();
        heroContainer!.classList.add(type);
        return Promise.resolve();
    }
}

customElements.define('da-monster-player-hero', Playerhero_com);