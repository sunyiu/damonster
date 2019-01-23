'use strict';

import DaMonsterCard from './damonstercard.js'

export default class DaMonsterNpc extends HTMLElement {
    public static get is(): string { return 'da-monster-npc'; }

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
                #hand-context da-monster-card{
                    position: relative;
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
                
                #msg{
                    position: absolute;
                    top: 0;
                    right: 0;
                    font-size: 14pt;
                }
                #msg.hide{
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
                    
                    <div id="msg"></div>

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
            </div>
        `;
    }

    public static get properties() {
        return {
            'data-name': {
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

        for (let key in DaMonsterNpc.properties) {
            attributes.push(key.toLowerCase());
        }

        if (name === 'data-is-active' && newValue) {
            if (newValue = 'true') {
                console.log('turn changed');
            }
        }

        return attributes;
    }

    private props: any = {};

    public constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        
        // Initialize declared properties
        for (let key in DaMonsterNpc.properties) {
            this.props[key] = DaMonsterNpc.properties[key].value;
        }

        this.requestRender();
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


    private _readyPromise;
    public get done() {
        if (!this._readyPromise) {
            return Promise.resolve();
        } else {
            return this._readyPromise;
        }
    }
    public set done(value){
        this._readyPromise = value;
    }

    public addAction(action, ...args) {     
        console.log('action - %s :: %o', action, args);   
        if (!this._readyPromise) {
            this._readyPromise = this.selectAction(action, args);
        } else {
            this._readyPromise.then(() => {
                return this.selectAction(action, args);
            })
        }
    }

    private selectAction(action, args) {
            switch(action){
                case 'react-action':
                    //show thinking indicator for half sec....
                    return new Promise((resolve, reject) =>{
                        setTimeout(() => {
                            this.reactAction();
                            resolve();    
                        }, 500);                                                                                        
                    });
                
                case 'set-hand':
                    return this.setHand(args[0]);
                break;
                    
                case 'set-hero':
                    return this.setHero(args[0]);
                    // return new Promise((resolve, reject) =>{
                    //     setTimeout(() => {
                    //         this.setHero(args[0]);
                    //         resolve();    
                    //     }, 500);                                                                                        
                    // });                
                
                case 'equip-hero':
                    return new Promise((resolve, reject) =>{
                        setTimeout(() => {
                            this.equipHero(args[0]);
                            resolve();    
                        }, 500);                                                                                        
                    });                                                        
            }                                    
    }
        
    public setHand(card){
        let context = this.shadowRoot.getElementById('hand-context');
        
        if (!card){
            //remove all
            while (context.firstChild) {
                context.removeChild(context.firstChild);
            }
            return;                        
        }   
        
             
        let ids = Array.from(context.children).map((c) => {return parseInt(c.getAttribute('data-id'));}),
            index = ids.findIndex((id) => { return id == card.id;});
        
        if (index > 0){
            //remove card
            return new Promise((resolve, reject) =>{
                let card = context.children[index],
                    keyframes = [];
                
                if (card.getAttribute('data-card-type') == 'a'){
                    keyframes.push({top: 0}, {top: '15px'});                        
                }else{
                    keyframes.push({top: 0}, {top: '-15px'});
                }
                
                let animation = card.animate(keyframes, {
                    duration: 500,
                    iterations: 1,
                    //endDelay: 100
                });
                animation.onfinish = (e) =>{
                    context.removeChild(card);
                    resolve();
                }                            
            });
        }else{
            //add card
            return new Promise((resolve, reject) =>{
                let daMonsterCard = new DaMonsterCard();
                daMonsterCard.setAttribute('id', 'id' + card.id);
                daMonsterCard.setAttribute('data-id', card.id);
                if (card.point) {
                    daMonsterCard.setAttribute('data-point', card.point);
                }
                daMonsterCard.setAttribute('data-card-type', card.type);
                switch (card.type) {
                    case 'h':
                    case 'i':
                        daMonsterCard.setAttribute('data-hero', card.heroType);
                        break;
                    case 'a':
                        daMonsterCard.setAttribute('data-action', card.action)
                        break;
                }                
                //daMonsterCard.showBack();                                                     
                                                                                    
                let animation = daMonsterCard.animate([                        
                    // keyframes
                    { left: '100px', opacity: 0 }, 
                    { left: 0, opacity: 1 }
                ], { 
                    // timing options
                    duration: 500,
                    iterations: 1,
                    //endDelay: 100
                });
                animation.onfinish = (e) =>{
                    resolve();
                }
                
                context.appendChild(daMonsterCard);
            });                                                                                      
        }
            
        
             
//         let context = this.shadowRoot.getElementById('hand-context'),
//             promises = [];
//         
//         if (!cards || cards.length == 0){
//             //remove all from hand            
//             while (context.firstChild) {
//                 context.removeChild(context.firstChild);
//             }
//             return Promise.resolve();            
//         }
//                         
//         Array.from(context.children).forEach((c) => {
//             if (cards.every((card) => { return card.id != parseInt(c.getAttribute('data-id')); })){
//                 promises.push(new Promise((resolve, reject) => {
//                     let keyframes = [];
//                     if (c.getAttribute('data-card-type') == 'a'){
//                         keyframes.push({top: 0}, {top: '15px'});                        
//                     }else{
//                         keyframes.push({top: 0}, {top: '-15px'});
//                     }
//                     let animation = c.animate(keyframes, {
//                         duration: 500,
//                         iterations: 1
//                     });
//                     animation.onfinish = (e) =>{
//                         context.removeChild(c);
//                         resolve();
//                     }                    
//                 }));            
//             }            
//         });
//                 
//         cards.forEach((card) => {
//             if (Array.from(context.children).every((n) => {
//                 return parseInt(n.getAttribute('data-id')) != card.id;
//             })){
//                 let daMonsterCard = new DaMonsterCard();
//                 promises.push(new Promise((resolve, reject) =>{                    
//                     let animation = daMonsterCard.animate([                        
//                         // keyframes
//                         { left: '100px', opacity: 0 }, 
//                         { left: 0, opacity: 1 }
//                     ], { 
//                         // timing options
//                         duration: 500,
//                         iterations: 1
//                     });
//                     animation.onfinish = (e) =>{
//                         resolve();
//                     }                              
//                 }));                        
//              
//                 //daMonsterCard.showBack();
// 
//                 daMonsterCard.setAttribute('id', 'id' + card.id);
//                 daMonsterCard.setAttribute('data-id', card.id);
//                 if (card.point) {
//                     daMonsterCard.setAttribute('data-point', card.point);
//                 }
//                 daMonsterCard.setAttribute('data-card-type', card.type);
//                 switch (card.type) {
//                     case 'h':
//                     case 'i':
//                         daMonsterCard.setAttribute('data-hero', card.heroType);
//                         break;
//                     case 'a':
//                         daMonsterCard.setAttribute('data-action', card.action)
//                         break;
//                 }
//                 //daMonsterCard.showBack();                        
//                 context.appendChild(daMonsterCard);                
//             }
//         })
//         
//         return Promise.all(promises);
//         
// //         let hand = Array.from(this.shadowRoot.getElementById('hand-context').children);
// //         if (hand.length < 1) {
// //             return
// //         }
// // 
// //         let cardWidth = hand[0].offsetWidth,
// //             maxNumberOfCards = Math.floor(document.body.offsetWidth / cardWidth) - 1;
// // 
// //         hand.forEach((c, index) => {
// //             if (index < maxNumberOfCards) {
// //                 hand[index].show();
// //             } else {
// //                 hand[index].hide();
// //             }
// //         });
// //         if (hand.length > maxNumberOfCards) {
// //             //add ...
// //         }                                
    }
        
    public setHero(hero) {
        let heroContainer = this.shadowRoot.getElementById('da-hero-container');
         
        heroContainer.classList.remove('k', 'w', 'r');
        this.equipHero(null);        
        
        if (!hero){
            heroContainer.setAttribute('data-hero-point', 0);
            this.shadowRoot.getElementById('point-context').innerHTML = '';
            return Promise.resolve();
        }                
        
        heroContainer.setAttribute('data-hero-point', hero.point);
        this.shadowRoot.getElementById('point-context').innerHTML = hero.totalPoint;
        heroContainer.classList.add(hero.heroType);
        return Promise.resolve();                                         
    }
    
    public equipHero(items){
        let context = this.shadowRoot.getElementById('items-context');        
        if (!items || items.length < 1){
            while (context.firstChild) {
                    context.removeChild(context.firstChild);
            }        
            return;            
        }
        
        let equiped = Array.from(context.children),
            totalPoint = parseInt(this.shadowRoot.getElementById('da-hero-container').getAttribute('data-hero-point'));
        
        items.forEach((item) => {
            totalPoint += item.point;
            
            if (equiped.every((e) => {return e.id != item.id;})){
                let card = document.createElement('div');
                card.setAttribute('id', 'id' + item.id);
                card.innerHTML = item.point;
                context.append(card);                
            }
        });
        this.shadowRoot.getElementById('point-context').innerHTML = totalPoint;
    }

    public addMonsterKilled(id) {
        let card = document.createElement('div');
        card.setAttribute('id', id);
        this.shadowRoot.getElementById('monster-context').append(card);
    }

    public reactAction() {
        this.dispatchEvent(new CustomEvent('react-action', { bubbles: true, composed: true }));
    }
}

customElements.define(DaMonsterNpc.is, DaMonsterNpc);