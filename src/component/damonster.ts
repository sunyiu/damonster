'use strict';

import DaCard from './dacard.js'

export default class DaMonsterComponent extends HTMLElement {
    public static get is(): string { return 'da-monster'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-monster-container{
                    padding-bottom: 15px;
                }
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-monster-container">
                <div id="da-monster-context"></div>
            </div>
        `;
    }
    
    public static get properties(){
        return{
            'data-card':{
                type: String,
                value: ''
            }
        };
    }
   
    public static get observedAttributes(): string[] {
        
        const attributes: string[] = [];

        for (let key in DaMonsterComponent.properties) {
            attributes.push(key.toLowerCase());
        }

        return attributes;
    }

    private props: any = {};
    private currentAction;   

    public constructor() {
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        for (let key in DaMonsterComponent.properties) {
            this.props[key] = DaMonsterComponent.properties[key].value;
        }                                

        this.requestRender();        
    }
    
    public attributeChangedCallback(name: string, oldValue: string, newValue: string, namespace: string): void {
        if (oldValue === newValue) {
            return;
        }

        this.props[name] = newValue;           
        
        if (name === 'data-card' && newValue){
            Array.from(this.shadowRoot.getElementById('da-monster-context').children).forEach((c) =>{
                c.remove();
            });
            
            let monster = JSON.parse(newValue);
            if (monster.card){
                let daCard = new DaCard();
                daCard.setAttribute('id', 'id', monster.card.id);
                daCard.setAttribute('data-id', monster.card.id);                
                daCard.setAttribute('data-point', monster.card.point);
                daCard.setAttribute('data-card-type', monster.card.type);
                
                this.shadowRoot.getElementById('da-monster-context').appendChild(daCard);                
            }
        }                                        
    }
    
    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        
        template.innerHTML = this.getTemplate({});
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }             
}

customElements.define(DaMonsterComponent.is, DaMonsterComponent);