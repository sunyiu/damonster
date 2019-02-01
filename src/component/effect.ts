'use strict';

export default class Effect_com extends HTMLElement {
    public static get is(): string { return 'da-monster-effect'; }

    public getTemplate(props: any): string {
        return `
            <style> 
                #da-effect-container {
                    color:#999;
                    text-transform: uppercase;
                    font-size:36px;
                    font-weight:bold;
                    padding-top:200px;  
                    position:fixed;
                    width:100%;
                    bottom:45%;
                    display:block;
                }
                
                                                                                                                                                               
			</style>
            <!-- shadow DOM for your element -->
            <div id="da-effect-container">
                <div><div>testing</div></div>
            </div>
        `;
    }
    
    public static get properties(){
        return{
        };
    }
   
    public static get observedAttributes(): string[] {        
        const attributes: string[] = [];

        for (let key in Effect_com.properties) {
            attributes.push(key.toLowerCase());
        }
        return attributes;
    }

    private props: any = {};
       
    public constructor(){
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        for (let key in Effect_com.properties) {
            this.props[key] = Effect_com.properties[key].value;
        }                        

        this.requestRender();                                                               
    }    
    
    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        
        template.innerHTML = this.getTemplate({});
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    
    public TurnChnage(msg):void{
        
    }                
}

customElements.define(Effect_com.is, Effect_com);