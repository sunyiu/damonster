'use strict';

export default class DaCard extends HTMLElement {
    public static get is(): string { return 'da-card'; }

    public getTemplate(props: any): string {
        return `
            <style>            
                #da-card-container{
                    display: inline-block;
                    border: 1px solid #ccc;
                    margin: 3px;
                    border-radius: 5px;
                    position: relative;
                    background-color: #fff;                
                }
                #da-card-container.selected{
                    border:2px solid red;
                    margin:2px;
                }
                #da-card-container.disabled #da-card-context{
                    background-color: #7f7f7f !important;
                }
                #da-card-container #da-card-context{
                    /*0.7142857142857143 -- card ratio*/                    
                    width: 71px;
                    height: 100px;
                    margin: 3px;
                    background-color: #7F7F7F;
                    border-radius: 3px;
                    position: relative;
                }
                #da-card-container #da-card-context .icon{
                    width: 25px;
                    height: 40px;
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background-size: contain;
                    background-repeat: no-repeat;
                    color: black;
                }
                #da-card-container #da-card-context .icon .point{
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    font-size: 12px;
                }
                
                #da-card-container.card-h #da-card-context{
                    background-color: #E6D81E;
                }                
                #da-card-container.card-i #da-card-context{
                    background-color: #14850E;
                    
                }
                #da-card-container.card-i.hero-k #da-card-context .icon,
                #da-card-container.card-h.hero-k #da-card-context .icon{
                    background-image: url(images/swordIcon_black.png);                    
                }
                #da-card-container.card-i.hero-w #da-card-context .icon,
                #da-card-container.card-h.hero-w #da-card-context .icon{
                    background-image: url(images/staffIcon_black.png);
                    
                }
                #da-card-container.card-i.hero-r #da-card-context .icon,
                #da-card-container.card-h.hero-r #da-card-context .icon {
                    background-image: url(images/arrowIcon_black.png);
                }
                
                #da-card-container.card-a #da-card-context{
                    background-color: #A21515;
                }                
                #da-card-container.card-a #da-card-context .icon{
                    
                }
                
                #da-card-container.card-m #da-card-context{
                    background-color: #3F3F3F;                    
                }                
                #da-card-container.card-m #da-card-context .icon{
                    
                }
                
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-card-container">
                <div id="da-card-context" class="">
                    <div class="icon">
                        <div id="point-context" class="point"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    public static get properties(){
        return{
            'data-card-type':{
                type: String,
                value: ''
            },
            'data-hero-type':{
                type: String,
                value: ''
            },
            'data-id': {
                type: String,
                value: ''
            },
            'data-point':{
                type: String,
                value: ''
            },
        };
    }
   
    public static get observedAttributes(): string[] {        
        const attributes: string[] = [];

        for (let key in DaCard.properties) {
            attributes.push(key.toLowerCase());
        }
        return attributes;
    }

    private props: any = {};   

    public constructor() {
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        for (let key in DaCard.properties) {
            this.props[key] = DaCard.properties[key].value;
        }        

        this.requestRender();
        
        this.shadowRoot.getElementById('da-card-container').onclick = this.toggleSelect;
    }
    
    public attributeChangedCallback(name: string, oldValue: string, newValue: string, namespace: string): void {
        if (oldValue === newValue) {
            return;
        }

        this.props[name] = newValue;     
        
        if (name === 'data-card-type' && newValue) {
            let className = 'card-' + newValue            
            this.shadowRoot.getElementById('da-card-container').className = 
                this.shadowRoot.getElementById('da-card-container').className.replace(/card-h|card-i|card-a|card-m/i, '');
             this.shadowRoot.getElementById('da-card-container').className += (' ' + newValue + ' ');
        }               
        
        if (name === 'data-hero-type' && newValue){
            let className = 'hero-' + newValue;
            this.shadowRoot.getElementById('da-card-container').className = 
                this.shadowRoot.getElementById('da-card-container').className.replace(/hero-k|hero-w|hero-r/i, '');
             this.shadowRoot.getElementById('da-card-container').className += (' ' + newValue + ' ');            
        }
        
        if (name === 'data-point' && newValue){
            this.shadowRoot.getElementById('point-context').innerHTML = newValue;
        }
                            
    }
    
    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        
        template.innerHTML = this.getTemplate({});
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    
    private toggleSelect(e): void{
        e.currentTarget.classList.toggle('selected');
        let isSelected = e.currentTarget.classList.contains('selected');        
        e.currentTarget.dispatchEvent(new CustomEvent('card-toggle', {detail: isSelected, bubbles: true, composed: true}));
        
    }
}

customElements.define(DaCard.is, DaCard);