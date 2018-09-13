'use strict';

export default class DaPlayer extends HTMLElement {
    public static get is(): string { return 'da-player'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-player-container{
                    font-size: 0.5em;
                    padding-bottom: 15px;
                }
                .container{
                    padding-bottom: 10px;
                }
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-player-container">
                <div id="da-hero-container" class="container">
                    <div><strong>HERO</strong>&nbsp;&nbsp;<span id="point-context"></span></div>
                    <div>
                        <span id="hero-context"></span>
                        <span>&nbsp;</span>
                        <span id="hero-item-context"></span>
                    </div>
                </div>            
                <div id="da-hand-container" class="container">
                    <div><strong>HAND</strong></div>
                    <div id="hand-context"></div>
                </div>
                <div id="da-monster-kill-container" class="container">
                    <div><strong>Killed</strong></div>
                    <div id="monster-context"></div>
                </div>
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
            },
            'data-point':{
                type: String,
                value: ''
            },
            'data-hero-items': {
                type: String,
                value: ''
            },
            'data-monster-killed':{
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
        
        if (name === 'data-point' && newValue){
            this.shadowRoot.getElementById('point-context').innerHTML = newValue;
        }
        
        if (name === 'data-hero-items' && newValue){
            this.shadowRoot.getElementById('hero-item-context').innerHTML = newValue;
        }
        
        if (name === 'data-monster-killed' && newValue){
            this.shadowRoot.getElementById('monster-context').innerHTML = newValue;
        }
                        
        
    }
    
    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        
        template.innerHTML = this.getTemplate({});
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define(DaPlayer.is, DaPlayer);