'use strict';
import { DaCardType, ICard_com_data } from './idamonster';

const template = document.createElement('template');
template.innerHTML = `
<style>                                              
    #da-card-container{
        position: relative;
        display: inline-block;                    
    }
    #da-card-container.flip .front{
        z-index: 80;
        -webkit-transform: rotateY(179deg);
        transform: rotateY(179deg);
    }            
    #da-card-container.flip .back{
        z-index: 90;
        -webkit-transform: rotateX(0) rotateY(0);
        transform: rotateX(0) rotateY(0);
    }
                                
    .card-container{
        display: inline-block;
        background-color: #fff;                    
        float: none;                    
        margin: 2px; 
        padding: 2px;                   
        border: 1px solid #ccc;
        border-radius: 2px;
        font-size: 10pt;               
    }
    
    .front{
        position: relative;                    
        z-index: 80;
        -webkit-transform: rotateX(0) rotateY(0);
        transform: rotateX(0) rotateY(0);
        -webkit-transform-style: preserve-3d;
        transform-style: preserve-3d;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-transition: all .4s ease-in-out;
        transition: all .4s ease-in-out;
    }
    .back{
        position: absolute;
        top: 0;
        left: 0;
        z-index: 70;
        -webkit-transform: rotateY(-179deg);
        transform: rotateY(-179deg);
        -webkit-transform-style: preserve-3d;
        transform-style: preserve-3d;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-transition: all .4s ease-in-out;
        transition: all .4s ease-in-out;
    }
                                                                                            
    .context{
        /*0.7142857142857143 -- card ratio*/                    
        width: 36px;
        height: 50px;                  
        background-color: #7F7F7F;
        border-radius: 3px;
        position: relative;
        
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;                    
    }                
    .front .context{
        background-color: lightblue;
    }
                                    
    .back.card-h .context,
    .back.card-i .context{
        background-color: white;
    }                                           
                            
    .back.hero-k .context{
        background-color: rgba(91, 192, 235, 1);
    }
    .back.hero-w .context{
        background-color: rgba(226, 49, 223, 1);
    }
    .back.hero-r .context{
        background-color: rgba(155, 197, 61, 1);
    }

    .back.card-h.hero-k .context{
        background-image: url(images/knight.png);
    }
    .back.card-h.hero-w .context{
        background-image: url(images/wizard.png);
    }
    .back.card-h.hero-r .context{
        background-image: url(images/ranger.png);
    }                                
                    
    .back.card-i.hero-k .context{
        background-image: url(images/swordIcon.png);
    }
    .back.card-i.hero-w .context{
        background-image: url(images/staffIcon.png);
    }
    .back.card-i.hero-r .context{
        background-image: url(images/arrowIcon.png);
    }                                
    
    
    .back.card-a .context{
        background-color: rgba(229, 89, 52, 1);
    }                
    .back.card-a .context .icon{
        
    }
    
    /*
        AtomicBomb - 0,
        Stop - 1,
        Radar - 2,
        Steal - 3,
        // Super,
        // PerfectCube,
        Retreat - 4,
        Provoke - 5,
        Attack - 6,	
        //SuicideBelt - 7,
        //MindReading - 8,
    */             
    .back.card-a.action-0 .context{
        background-image: url(images/bomb.png);
    }
    .back.card-a.action-1 .context{
        background-image: url(images/stop.png);
    }
    .back.card-a.action-2 .context{
        background-image: url(images/radar.png);
    }                
    .back.card-a.action-3 .context{
        background-image: url(images/steal.png);                    
    }
    .back.card-a.action-4 .context{
        background-image: url(images/retreat.png);
    }
    .back.card-a.action-5 .context{
        background-image: url(images/provoke.png);
    }
    .back.card-a.action-6 .context{
        background-image: url(images/swordIcon.png);
    }
    /*
    .back.card-a.action-7 .context{
        background-image: url(images/suicidebelt.png);
    }
    .back.card-a.action-8 .context{
        background-image: url(images/mindreading.png);
    }*/                                                                               
    
    
    .back.card-m .context{
        background-color: #000;    
        background-image: url(images/GodzillaSilhouetteT.png);
    }                
    .back.card-m .context .icon{                    
    }                                                                         
    
    #da-card-container.selected .card-container{
        border:2px solid red;
        margin:1px;
        padding:1px;
    }
    
    #da-card-container.disabled .context{
        /*background-color: #7f7f7f !important;*/
    }
                                                                                                             
    #da-card-container.hidden{
        display:none;                    
    }
        
    @keyframes removeCard {
        0%{
            transform: scalex(1);
            -webkit-transform: scalex(1);
        }
        15%{
            transform: scalex(1.2);
            -webkit-transform: scalex(1.2);            
        }
        100%{
            transform: scalex(0.1);
            -webkit-transform: scalex(0.1);            
        }
        
    }   
    
    @keyframes addCard {
        0%{
            transform: scalex(0);
            -webkit-transform: scalex(0);
        }
        75%{
            transform: scalex(1.2);
            -webkit-transform: scalex(1.2);            
        }
        100%{
            transform: scalex(1);
            -webkit-transform: scalex(1);            
        }
        
    }
    #da-card-container{
        animation-duration: 0.5s; 
        animation-timing-function: ease-out; 
        animation-delay: 0s;
        animation-direction: alternate;
        animation-iteration-count: 1;
        animation-fill-mode: none;
        animation-play-state: running; 
    }                        
    
    #da-card-container.remove{
        animation-name: removeCard;
    }
    #da-card-container.add{
        animation-name: addCard;
    }   
    
    
    #star-container{
        display: flex;
        flex-direction: row-reverse;
    }
    .star{
        width: 10px;
        height: 10px;
        fill: rgba(253, 231, 76, 1);
        /*background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;*/                                                          
    }                               
</style>

<!-- shadow DOM for your element -->
<div id="da-card-container">
    <div class="card-container front">
        <div class="context"></div>
    </div>            
    <div class="card-container back">
        <div class="context">
            <div id="star-container"></div>
        </div>
    </div>
</div>
`;

export enum Card_com_events {
    Clicked = 'clicked'
}

export default class Card_com extends HTMLElement {
    static get observedAttributes() { return []; }

    public get isSelected() {
        return this._container.classList.contains('selected');
    }
    public set isSelected(value: boolean) {
        if (value) {
            this._container.classList.add('selected');
        } else {
            this._container.classList.remove('selected');
        }
    }

    public get isFlip() {
        return this._container.classList.contains('flip');
    }
    public set isFlip(value: boolean) {
        if (value) {
            this._container.classList.add('flip');
        } else {
            this._container.classList.remove('flip');
        }
    }

    public get isHidden(){
        return this._container.classList.contains('hidden');
    }
    public set isHidden(value: boolean){
        if (value){
            this._container.classList.add('hidden');
        }else{
            this._container.classList.remove('hidden');
        }
    }

    public get cardType(): DaCardType | ''{
        if (!this._data){
            return '';
        }
        return this._data.cardType;
    }

    private _data?: ICard_com_data;
    private _shadowRoot: ShadowRoot;
    private _container: HTMLElement;

    public constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._container = this._shadowRoot.getElementById('da-card-container') as HTMLElement;
    }

    public connectedCallback() {
        this._container!.onclick = (e) => {
            this.dispatchEvent(new CustomEvent(Card_com_events.Clicked, { detail: null, bubbles: true, composed: true }));
        };
    }

    public disconnectedCallback() { }

    public attributeChangedCallback(name: string, oldValue: any, newValue: any) { }

    public set(data: ICard_com_data){
        this._data = data;
        this.id = data.id.toString();
        
        const elem = this.shadowRoot!.querySelector('.back');
        
        elem!.classList.add('card-' + data.cardType);
        
        switch (data.cardType) {
            case DaCardType.Hero:
            case DaCardType.Item:
                let className = 'hero-' + data.heroType;
                elem!.classList.remove('hero-k', 'hero-w', 'hero-r');
                elem!.classList.add(className);
                break;
            case DaCardType.Action:
                elem!.classList.add('action-' + data.action);
                break;
        }

        if (data.point) {
            let starContainer = this.shadowRoot!.getElementById('star-container');
            for (var i = 0; i < data.point; i++) {
                let star = document.createElement('div');
                star.classList.add('star');
                star.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>';
                starContainer!.appendChild(star);
            }
        }
    }

    public flip(): Promise<void> {
        return new Promise((resolve, reject) => {
            const callback = (e: any) => {
                    this._container.removeEventListener('webkitTransitionEnd', callback);
                    resolve();
                }
            this._container.addEventListener('webkitTransitionEnd', callback);
            this._container.classList.toggle('flip');
        });
    }

    // public remove() {
    //     return new Promise((resolve, reject) => {
    //         const callback = (e: any) => {
    //                 this._container.removeEventListener('webkitAnimationEnd', callback);
    //                 this._container.classList.remove('remove');             
    //                 resolve();
    //             }

    //         this._container.addEventListener('webkitAnimationEnd', callback);
    //         this._container.classList.add('remove');
    //     });
    // }

    // public add(flip: boolean): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         const callback = (e: any) => {
    //                 this._container.removeEventListener('webkitAnimationEnd', callback);
    //                 this._container.classList.remove('add');
    //                 resolve();
    //             }

    //         this._container.addEventListener('webkitAnimationEnd', callback);
    //         this._container.classList.add('add');
    //         if (flip) {
    //             this._container.classList.add('flip');
    //         }
    //     });
    // }
}

customElements.define('da-card', Card_com);