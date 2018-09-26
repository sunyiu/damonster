'use strict';

export default class DaMonsterComponent extends HTMLElement {
    public static get is(): string { return 'da-monster'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-monster-container{
                    height: 150px;
                    background-color: lightgray;                                        
                }
                #da-monster-container #da-monster-context{
                    position: relative;
                }
                #da-monster-container #da-monster-context #da-monster{
                    display: block;
                    width: 125px;
                    height: 125px;
                    background-size: contain;
                    background-image: url(images/monster.png);
                    background-repeat: no-repeat;
                    position: absolute;
                    top: 12px;
                    left: 50%;
                    margin-left: -62px                                        
                }
                #da-monster-container #da-monster-context #da-monster.hidden{
                    display: none;
                }
                #da-monster-container #da-monster-context #da-monster #da-monster-point{
                    font-size: 30pt;
                    font-weight: bold;
                    background-color: rgba(255,255,255,0.75);
                    display: block;
                    width: 50px;
                    text-align: center;
                    border-radius: 10px;
                }
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-monster-container">
                <div id="da-monster-context">
                    <div id="da-monster" class="hidden"><div id="da-monster-point"></div></div>
                    <div id="da-monsters-left-container"></div>
                </div>
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
            let data = JSON.parse(newValue);
            
            if (data.monster){
                let id = data.monster.id;
                this.shadowRoot.getElementById('da-monster').classList.remove('hidden');
                this.shadowRoot.getElementById('da-monster-point').innerHTML = data.monster.point;
            }else{
                this.shadowRoot.getElementById('da-monster').classList.add('hidden');
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