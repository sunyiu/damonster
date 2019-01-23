'use strict';

export enum DaCardEvents {
    Toggle = 'toggle'
}


export default class DaMonsterCard extends HTMLElement {
    public static get is(): string { return 'da-monster-card'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-card-container{
                    position: relative;
                    display: inline-block;                    
                }
                #da-card-container.flip .front{
                    z-index: 900;
                    -webkit-transform: rotateY(179deg);
                    transform: rotateY(179deg);
                }            
                #da-card-container.flip .back{
                    z-index: 1000;
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
                    z-index: 900;
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
                    z-index: 800;
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
                }                
                .front .context{
                    background-color: lightblue;
                }
                
                .back .context .icon{
                    padding: 2px;
                    color: black;
                }
                .back .context .icon #point-context{
                    font-size: 12px;
                    text-align: right;
                    background-size: contain;
                    background-repeat: no-repeat;                    
                }
                
                .back.card-h .context{
                    background-color: #E6D81E;
                }                
                .back.card-i .context{
                    background-color: #14850E;
                    
                }
                .back.card-i.hero-k .context .icon #point-context,
                .back.card-h.hero-k .context .icon #point-context{
                    background-image: url(images/swordIcon_black.png);                    
                }
                .back.card-i.hero-w .context .icon #point-context,
                .back.card-h.hero-w .context .icon #point-context{
                    background-image: url(images/staffIcon_black.png);
                    
                }
                .back.card-i.hero-r .context .icon #point-context,
                .back.card-h.hero-r .context .icon #point-context {
                    background-image: url(images/arrowIcon_black.png);
                }
                
                .back.card-a .context{
                    background-color: #A21515;
                }                
                .back.card-a .context .icon{
                    
                }
                
                .back.card-m .context{
                    background-color: #3F3F3F;                    
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
                    animation-duration: 1s; 
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
                                                                                
                                                
			</style>
            <!-- shadow DOM for your element -->
            <div id="da-card-container">
                <div class="card-container front">
                    <div class="context"></div>
                </div>            
    			<div class="card-container back">
                    <div class="context">
                        <div id="da-card-action"></div>
                        <div class="icon">
                            <div id="point-context" class=""></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    public static get properties(){
        return{
            // 'data-card-type':{
            //     type: String,
            //     value: ''
            // },
            // 'data-hero':{
            //     type: String,
            //     value: ''
            // },
            // 'data-action': {
            //     type: String,
            //     value: ''
            // },
            // 'data-id': {
            //     type: String,
            //     value: ''
            // },
            // 'data-point':{
            //     type: String,
            //     value: ''
            // }
        };
    }
   
    public static get observedAttributes(): string[] {        
        const attributes: string[] = [];

        for (let key in DaMonsterCard.properties) {
            attributes.push(key.toLowerCase());
        }
        return attributes;
    }

    private props: any = {};
   
    
    private _isSelected: boolean = false;
    public get isSelected(){
        return this._isSelected;
    }
    public set isSelected(value){
        let elem = this.shadowRoot.getElementById('da-card-container');                        
        // if (value){
        //     elem.classList.add('selected');
        // }else{
        //     elem.classList.remove('selected');            
        // }
        this._isSelected = value;                
    }
        
    private _id: number;
    public get id(){
        return this._id;
    }   
    private _point: number;
    public get point(){
        return this._point;
    }
    private _cardType: string;
    public get cardType(){
        return this._cardType;
    }
    private _heroType: string;
    public get heroType(){
        return this._heroType;
    }
    private _action: string;
    public get action(){
        return this._action;
    }

    public constructor(){
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        for (let key in DaMonsterCard.properties) {
            this.props[key] = DaMonsterCard.properties[key].value;
        }                        

        this.requestRender();
                                                               
        let container = this.shadowRoot.getElementById('da-card-container');        
        container.onclick = (e) => {
            this.isSelected = !this.isSelected;
            this.dispatchEvent(new CustomEvent(DaCardEvents.Toggle, {detail: this._isSelected, bubbles: true, composed: true}));
        };
    }    
    
    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        
        template.innerHTML = this.getTemplate({});
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    
    public Set(id, point, cardType, heroType, action, isFlip){
        this._id = id;
        this._point = point;
        this._cardType = cardType;
        this._heroType = heroType;
        this._action = action;        
                                
        let elem = this.shadowRoot.querySelector('.back');
        
        this.setAttribute('id', 'id'+id);
        this.setAttribute('data-id', id);
        this.setAttribute('data-card-type', cardType);
                
        switch (cardType){
            case 'h':
            case 'i':
                let className = 'hero-' + heroType;
                elem.classList.remove('hero-k', 'hero-w', 'hero-r');
                elem.classList.add(className);                                        
                this.setAttribute('data-hero', heroType);
                break;
            case 'a':
                this.setAttribute('data-action', action)
                break;    
        }
                                
        if (point){
            this.shadowRoot.getElementById('point-context').innerHTML = point;            
            this.setAttribute('data-point', point);
        }
        
        if (isFlip){
            this.shadowRoot.getElementById('da-card-container').classList.add('flip');            
        }                
        
        //elem.classList.remove('card-h', 'card-i', 'card-a', 'card-m');
        elem.classList.add('card-' + cardType);             
                
        if (action) {
            let action = '';
            switch (action) {
                case '0':
                    action = 'Atomic Bomb';
                    break
                case '1':
                    action = 'Stop';
                    break
                case '2':
                    action = 'Radar';
                    break
                case '3':
                    action = 'Steal';
                    break;                                        
                case '4':
                    action = 'Swap';
                    break
                case '5':
                    action = 'Provoke';
                    break
                case '6':
                    action = 'Attack';
                    break
                case '7':
                    action = 'Suicide Belt';
                    break;
                case '8':
                    action = 'Mind Reading';
                    break;                    
            }
            this.shadowRoot.getElementById('da-card-action').innerHTML = action;
        }        
    }
        
    public flip(){
        return new Promise((resolve, reject) =>{                         
            let elem = this.shadowRoot.getElementById('da-card-container'),
            callback = (e) =>{
                elem.removeEventListener('webkitTransitionEnd', callback);
                resolve();                
            }
                
            elem.addEventListener('webkitTransitionEnd', callback);
            elem.classList.toggle('flip');
        });
    }    
            
    public hide(){
        this.shadowRoot.getElementById('da-card-container').classList.add('hidden');
    }
    public show(){
        this.shadowRoot.getElementById('da-card-container').classList.remove('hidden');
    } 

    
    public remove(){       
        return new Promise((resolve, reject) =>{                        
            let card = this.shadowRoot.getElementById('da-card-container'),
            callback = (e) =>{
                card.removeEventListener('webkitAnimationEnd', callback);
                //this.hide();                
                resolve();                
            }
                
            card.addEventListener('webkitAnimationEnd', callback);
            card.classList.add('remove');
        });                         
    }

    public add(){       
        return new Promise((resolve, reject) =>{                        
            let card = this.shadowRoot.getElementById('da-card-container'),
            callback = (e) =>{
                card.removeEventListener('webkitAnimationEnd', callback);
                card.classList.remove('add');               
                resolve();                
            }
                
            card.addEventListener('webkitAnimationEnd', callback);
            card.classList.add('add');
        });                         
    }           
}

customElements.define(DaMonsterCard.is, DaMonsterCard);