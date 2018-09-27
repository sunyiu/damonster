'use strict';

export default class DaMonsterComponent extends HTMLElement {
    public static get is(): string { return 'da-monster'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-monster-container{
                    background-color: lightgray;
                    height: 80px;                                        
                }
                #da-monster-container #da-monster-context{
                    position: relative;
                }
                #da-monster-container #da-monster-context #da-monster{
                    display: block;
                    width: 60px;
                    height: 60px;
                    background-size: contain;
                    background-image: url(images/monster.png);
                    background-repeat: no-repeat;
                    position: absolute;
                    top: 5px;
                    left: 50%;
                    margin-left: -30px                                        
                }
                #da-monster-container #da-monster-context #da-monster.hidden{
                    display: none;
                }
                #da-monster-container #da-monster-context #da-monster #da-monster-point{
                    font-size: 8pt;
                    font-weight: bold;
                    background-color: rgba(255,255,255,0.75);
                    display: block;
                    text-align: center;
                    border-radius: 10px;
                    padding-top: 50;
                    width: 25px;
                    margin-top: 5px;                    
                }
                
                #da-monsters-left-container{
                    display: flex;
                    padding: 5px;
                }
                #da-monsters-left-container .da-monster{
                    position: relative;
                    width: 35px;
                    height: 35px;
                    background-size: contain;
                    background-image: url(images/monster.png);
                    background-repeat: no-repeat;
                    font-size: 10pt;
                }
                #da-monsters-left-container .da-monster #da-monster-point{
                    background-color: rgba(255,255,255, 0.75);
                    top: 50%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    padding: 2px;
                    border-radius: 5px;                    
                }
                
                @media only screen and (min-width: 500px) {
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
    }
    
    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        
        template.innerHTML = this.getTemplate({});
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    
    public setMonster(monster){
        if (monster){
            let id = monster.id;
            this.shadowRoot.getElementById('da-monster').classList.remove('hidden');
            this.shadowRoot.getElementById('da-monster-point').innerHTML = monster.point;
        }else{
            this.shadowRoot.getElementById('da-monster').classList.add('hidden');
        }                    
    }
    
    public addMonster(monster){
        let daMonster = document.createElement('div');
        daMonster.setAttribute('id', 'id'+monster.id);
        daMonster.classList.add('da-monster')
        daMonster.innerHTML = '<div id="da-monster-point">' +  monster.point + '</div>';
        this.shadowRoot.getElementById('da-monsters-left-container').append(daMonster);                
    }             
}

customElements.define(DaMonsterComponent.is, DaMonsterComponent);