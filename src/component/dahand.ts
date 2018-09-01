'use strict';

export default class DaHand extends HTMLElement {
    public static get is(): string { return 'da-hand'; }

    public getTemplate(props: any): string {
        return `
            <style>
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-hand-container"></div>
        `;
    }
    
    public static get properties(){
        return{
            'data-cards':{
                type: String,
                value: ''
            }
        };
    }
    
    public static get observedAttributes(): string[] {
        
        const attributes: string[] = [];

        for (let key in DaHand.properties) {
            attributes.push(key.toLowerCase());
        }

        return attributes;
    }

    private props: any = {};    

    public constructor() {
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        for (let key in DaHand.properties) {
            this.props[key] = DaHand.properties[key].value;
        }        

        this.requestRender();
    }
    
    public attributeChangedCallback(name: string, oldValue: string, newValue: string, namespace: string): void {
        if (oldValue === newValue) {
            return;
        }

        this.props[name] = newValue;
        
        if (name === 'data-cards' && newValue) {
            this.shadowRoot.getElementById('da-hand-container').innerHTML = newValue;
        }
    }
    
    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        
        template.innerHTML = this.getTemplate({});
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define(DaHand.is, DaHand);