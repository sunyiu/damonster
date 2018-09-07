'use strict';

export default class DaPlayer extends HTMLElement {
    public static get is(): string { return 'da-player'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-player-container{
                    font-size: 0.5em;
                }
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-player-container">
                <div id="da-hero-container"><span>HERO::</span><span id="hero-context"></span></div>            
                <div id="da-hand-container"><span>HAND::</span><span id="hand-context"></span></div>
            </div>
        `;
    }
    
    public static get properties(){
        return{
            'data-hand':{
                type: String,
                value: ''
            },
            'data-hero': {
                type: String,
                value: ''
            }
        };
    }
    
    public static get observedAttributes(): string[] {
        
        const attributes: string[] = [];

        for (let key in DaPlayer.properties) {
            attributes.push(key.toLowerCase());
        }

        return attributes;
    }

    private props: any = {};    

    public constructor() {
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        for (let key in DaPlayer.properties) {
            this.props[key] = DaPlayer.properties[key].value;
        }        

        this.requestRender();
    }
    
    public attributeChangedCallback(name: string, oldValue: string, newValue: string, namespace: string): void {
        if (oldValue === newValue) {
            return;
        }

        this.props[name] = newValue;
        
        if (name === 'data-hand' && newValue) {
            this.shadowRoot.getElementById('hand-context').innerHTML = newValue;
        }
        
        if (name === 'data-hero' && newValue){
            this.shadowRoot.getElementById('hero-context').innerHTML = newValue;
        }
    }
    
    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        
        template.innerHTML = this.getTemplate({});
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define(DaPlayer.is, DaPlayer);