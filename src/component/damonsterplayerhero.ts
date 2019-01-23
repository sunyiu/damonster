'use strict';

export default class DaMonsterPlayerHero extends HTMLElement {
    public static get is(): string { return 'da-monster-player-hero'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-hero-container{
                    position: relative;
                }
            
                hero-container{
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
                #hero-container.k #hero-context{
                    background-image: url(images/knight.png);
                }
                #hero-container.w #hero-context{
                    background-image: url(images/wizard.png);
                }
                #hero-container.r #hero-context{
                    background-image: url(images/ranger.png);
                }
                #hero-container #da-hero-type-icon{
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
                #hero-container.k #da-hero-type-icon{
                    background-image: url(images/swordIcon_black.png);
                }
                #hero-container.w #da-hero-type-icon{
                    background-image: url(images/staffIcon_black.png);
                }
                #hero-container.r #da-hero-type-icon{
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
                    display: flex;                  
                }
                
                #items-container  div{                
                    width: 25px;
                    height: 25px;
                    background-image: url(images/swordicon_black.png);
                    background-size: contain;
                    background-repeat: no-repeat;
                    margin-right: 5px;
                }                                                                                                
                
                @media only screen and (max-width: 500px) {                
                }
                
                #hero-context{
                    transition: all .2s ease-in-out;                    
                }
                
                @keyframes setHero {
                    0%, 100% {
                        transform: scale(1.0);
                        -webkit-transform: scale(1.0);
                    }
                    50%{
                        transform: scale(1.3);
                        -webkit-transform: scale(1.3);            
                    }
                }        
                
                #hero-context.set{
                    -webkit-animation: setHero 1s 1; /* Safari 4+ */
                    -moz-animation: setHero 1s 1; /* Fx 5+ */
                    -o-animation: setHero 1s 1; /* Opera 12+ */
                    animation: setHero 1s 1; /* IE 10+, Fx 29+ */      
                }
                
			</style>
            <!-- shadow DOM for your element -->
                <div id="da-hero-container">
                    <div id="hero-container">                        
                        <div id="da-hero-type-icon"></div>                
                        <div id="hero-context"></div>                                                                
                        <div id="point-container"><div id="point-context"></div></div>
                    </div>                    
                </div>
        `;
    }
    
    public static get properties(){
        return{
        };
    }
   
    public static get observedAttributes(): string[] {
        
        const attributes: string[] = [];

        for (let key in DaMonsterPlayerHero.properties) {
            attributes.push(key.toLowerCase());
        }
        
        return attributes;
    }
    
    private _point: number;
    public get point():number{
        return this._point;
    }
    private _heroType: string;
    public get heroType():string{
        return this._heroType;
    }
    
    public constructor() {
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        for (let key in DaMonsterPlayerHero.properties) {
            this.props[key] = DaMonsterPlayerHero.properties[key].value;
        }                                

        this.requestRender();           
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
    
    //------------------------------------------------------------        
    public Equip(point){
        let container = this.shadowRoot.getElementById('point-container');
        this._point += point;
        
        container.innerHTML = this._point;        
    }
    
    public Set(heroType, point){                
        let daHero = this.shadowRoot.getElementById('hero-container');
        
        if (!heroType){
            daHero.className = '';
            this._point = 0;
            return;            
        }   
          
        this._point = point;                           
        daHero.classList.add(heroType);
        
        return new Promise((resolve, reject) =>{
            setTimeout(() => {                         
                let hero = this.shadowRoot.getElementById('hero-context'),
                callback = (e) =>{
                    hero.removeEventListener('webkitAnimationEnd', callback);
                    hero.classList.remove('set');
                    resolve();                
                }
                    
                hero.addEventListener('webkitAnimationEnd', callback);
                hero.classList.add('set');
            }, 100);
        });                 
    }                
}

customElements.define(DaMonsterPlayerHero.is, DaMonsterPlayerHero);