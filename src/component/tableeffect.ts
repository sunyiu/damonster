'use strict';

export default class TableEffect_com extends HTMLElement {
    public static get is(): string { return 'da-monster-table-effect'; }

    public getTemplate(props: any): string {
        return `
            <style> 
                #da-effect-container {
                    position: absolute;
                    overflow: hidden;
                    width: 100%;
                    top: 0;
                    bottom: 0;
                    
                }
                
                @keyframes rollin_up {
                    0%{
                        margin-top: 35px;
                    }
                    100%{
                        margin-top: -35px;
                    }                    
                }
                
                @keyframes rollout_up{
                    0%{
                        margin-top: -35px;
                    }
                    
                    100%{
                        margin-top: -65px;
                    }
                }
                
                @keyframes rollinout_up{
                    0%{
                        margin-top: 35px;
                    }
                    25%{
                        margin-top: -35px;                        
                    } 
                    75%{
                        margin-top: -35px;                        
                    }                   
                    100%{
                        margin-top: -65px;
                    }                    
                }
                
                #da-effect-content{
                    display: block;
                    position: absolute;
                    top: 50%;
                    width: 100%;
                    text-align: center;                  
                    font-size: 60px;       
                    margin-top: -35px; 
                    
                    animation-duration: 0.5s; 
                    animation-timing-function: ease-out; 
                    animation-delay: 0s;
                    animation-direction: alternate;
                    animation-iteration-count: 1;
                    animation-fill-mode: none;
                    animation-play-state: running; 
                }
                #da-effect-content.hide{
                    display: none;
                }                      
                
                #da-effect-content.rollin_up{                   
                    animation-name: rollin_up;
                }
                #da-effect-content.rollout_up{
                    animation-name: rollout_up;
                }
                #da-effect-content.rollinout_up{
                    animation-duration: 2s;
                    animation-name: rollinout_up;
                }
                
                                                                                                                                                                                               
			</style>
            <!-- shadow DOM for your element -->
            <div id='da-effect-container'>
                <div id='da-effect-content' class='hide'></div>
            </div>
        `;
    }
    
    public static get properties(){
        return{
        };
    }
   
    public static get observedAttributes(): string[] {        
        const attributes: string[] = [];

        for (let key in TableEffect_com.properties) {
            attributes.push(key.toLowerCase());
        }
        return attributes;
    }

    //private props: any = {};
    
       
    public constructor(){
        super();
                
        this.attachShadow({mode: 'open'});
        
        // Initialize declared properties
        // for (let key in TableEffect_com.properties) {
        //     this.props[key] = TableEffect_com.properties[key].value;
        // }                        

        this.requestRender();                                                                     
    }    
    
    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');
        
        template.innerHTML = this.getTemplate({});
        
        this.shadowRoot!.appendChild(template.content.cloneNode(true));
    }
    
    
    public monsterInvade(point:any){
         return new Promise((resolve, reject) =>{                        
            let content = this.shadowRoot!.getElementById('da-effect-content'),
            callback = (e:any) =>{
                content!.removeEventListener('webkitAnimationEnd', callback);
                content!.classList.remove('rollin_up');       
                resolve();                
            }
            content!.innerHTML = '('+ point +')';
               
            content!.addEventListener('webkitAnimationEnd', callback);
            content!.classList.remove('hide');
            content!.classList.add('rollin_up');
        });                                       
    }
    
    public doneBattle(winner:any){
         return new Promise((resolve, reject) =>{                        
            let content = this.shadowRoot!.getElementById('da-effect-content'),
            callback = (e:any) =>{
                content!.removeEventListener('webkitAnimationEnd', callback);
                content!.innerHTML = '';
                content!.classList.remove('rollout_up');
                content!.classList.add('hide');       
                resolve();                
            }
                          
            content!.addEventListener('webkitAnimationEnd', callback);
            content!.classList.add('rollout_up');
        });         
    }
    
    public switchPlayer(player:any){
         return new Promise((resolve, reject) =>{                        
            let content = this.shadowRoot!.getElementById('da-effect-content'),
            callback = (e:any) =>{
                content!.removeEventListener('webkitAnimationEnd', callback);
                content!.innerHTML = '';
                content!.classList.remove('rollinout_up');
                content!.classList.add('hide');       
                resolve();                
            }
            
            content!.innerHTML = player;            
            content!.classList.remove('hide');                          
            content!.addEventListener('webkitAnimationEnd', callback);
            content!.classList.add('rollinout_up');
        });                 
    }                
}

customElements.define(TableEffect_com.is, TableEffect_com);