'use strict';

export enum Card_com_events {
    Clicked = 'clicked'
}


export default class Card_com extends HTMLElement {
    public static get is(): string { return 'da-monster-card'; }

    public getTemplate(props: any): string {
        return `
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

        for (let key in Card_com.properties) {
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
        if (value){
            elem.classList.add('selected');
        }else{
            elem.classList.remove('selected');            
        }
        this._isSelected = value;                
    }
        
    private _id: number;
    public get id(){
        return this._id;
    }   
    private _cardType: string;
    public get cardType(){
        return this._cardType;
    }
    
    /*
    private _action: string;
    public get action(){
        return this._action;
    }    
    private _point: number;
    public get point(){
        return this._point;
    }
    private _heroType: string;
    public get heroType(){
        return this._heroType;
    }
    */
    
    private _isFlip: boolean;
    public get isFlip(){
        return this._isFlip;
    } 
    public set isFlip(value){
        let elem = this.shadowRoot.getElementById('da-card-container');        
        if (value){
            elem.classList.add('flip');
        }else{
            elem.classList.remove('flip');
        }
        this._isFlip = value;        
    }
    
    public constructor(){
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        for (let key in Card_com.properties) {
            this.props[key] = Card_com.properties[key].value;
        }                        

        this.requestRender();
                                                               
        let container = this.shadowRoot.getElementById('da-card-container');        
        container.onclick = (e) => {
            this.dispatchEvent(new CustomEvent(Card_com_events.Clicked, {detail: null, bubbles: true, composed: true}));
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
                elem.classList.add('action-' + action);
                break;    
        }
                                
        if (point){
            let starContainer = this.shadowRoot.getElementById('star-container');
            for(var i=0; i<point; i++){
                let star = document.createElement('div');
                star.classList.add('star');
                star.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>';
                starContainer.appendChild(star);
            }                      
        }
        
        if (isFlip){
            this.shadowRoot.getElementById('da-card-container').classList.add('flip');            
        }                
        
        //elem.classList.remove('card-h', 'card-i', 'card-a', 'card-m');
        elem.classList.add('card-' + cardType);             
                
     
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
                card.classList.remove('remove');  
                //this.hide();                
                resolve();                
            }
                
            card.addEventListener('webkitAnimationEnd', callback);
            card.classList.add('remove');
        });                         
    }

    public add(flip){       
        return new Promise((resolve, reject) =>{                        
            let card = this.shadowRoot.getElementById('da-card-container'),
            callback = (e) =>{
                card.removeEventListener('webkitAnimationEnd', callback);
                card.classList.remove('add');               
                resolve();                
            }
                
            card.addEventListener('webkitAnimationEnd', callback);
            card.classList.add('add');
            if (flip){
                card.classList.add('flip');
            }
        });                         
    }           
}

customElements.define(Card_com.is, Card_com);