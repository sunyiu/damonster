'use strict';

export default class DaMonsterTable extends HTMLElement {
    public static get is(): string { return 'da-monster-table'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-monster-container{
                    background-color: lightgray;
                    height: 80px;
                }
                #da-monster-container #da-action-context{
                    position: relative;
                    display: flex;
                }
                #da-monster-container #da-action-context .da-monster{
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
                #da-monster-container #da-action-context .da-monster .da-monster-point{
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
                #da-monster-container #da-action-context .action{
                    width: 60px;
                    height: 60px;
                    background-color: red;
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
                #da-monsters-left-container .da-monster .da-monster-point{
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
                <div id="da-action-context">
                </div>
                <div id="da-monsters-left-container"></div>
            </div>
        `;
    }

    public static get properties() {
        return {
        };
    }

    public static get observedAttributes(): string[] {

        const attributes: string[] = [];

        for (let key in DaMonsterTable.properties) {
            attributes.push(key.toLowerCase());
        }

        return attributes;
    }

    private props: any = {};
    private currentAction;

    public constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        
        // Initialize declared properties
        for (let key in DaMonsterTable.properties) {
            this.props[key] = DaMonsterTable.properties[key].value;
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

    public addAction(card) {
        if (!card) {
            let context = this.shadowRoot.getElementById('da-action-context');
            while (context.firstChild) {
                context.removeChild(context.firstChild);
            }
            return;
        }

        //radar action....
        if (card.length && card.length > 1) {
            card.forEach((c) => {
                //add action card....
                let actionCard = document.createElement('div');
                actionCard.innerHTML = c.type;
                actionCard.classList.add('action');
                this.shadowRoot.getElementById('da-action-context').appendChild(actionCard);
            });

            setTimeout(() => {
                let context = this.shadowRoot.getElementById('da-action-context');
                while (context.firstChild) {
                    context.removeChild(context.firstChild);
                }
            }, 1000);
        }

        if (card.type == 'm') {
            //add monster
            let monsterCard = document.createElement('div');
            monsterCard.classList.add('da-monster');
            monsterCard.setAttribute('id', 'id' + card.id);
            let cardPoint = document.createElement('div');
            cardPoint.innerHTML = card.point;
            cardPoint.classList.add('da-monster-point');
            monsterCard.appendChild(cardPoint);

            this.shadowRoot.getElementById('da-action-context').appendChild(monsterCard);

            setTimeout(() => {
                this.dispatchEvent(new Event('battle', { dbubbles: true, composed: true }));
            }, 500);

        }

        if (card.type == 'a') {
            //add action card....
            let actionCard = document.createElement('div');
            actionCard.innerHTML = card.action;
            actionCard.classList.add('action');
            this.shadowRoot.getElementById('da-action-context').appendChild(actionCard);
        }
    }

    private addMonster(monster) {
        let daMonster = document.createElement('div');
        daMonster.setAttribute('id', 'id' + monster.id);
        daMonster.classList.add('da-monster')
        daMonster.innerHTML = '<div id="da-monster-point">' + monster.point + '</div>';
        this.shadowRoot.getElementById('da-monsters-left-container').append(daMonster);
    }
    
    public setAvailableMonsters(monsters){
        let container = this.shadowRoot.getElementById('da-monsters-left-container'),
            removed = [];  
        
        Array.from(container.children).forEach((n) => {
            if (!monsters.find((m) => {
                return m.id == parseInt(n.getAttribute('id').substring(2));
            })){                
                removed.push(n);
            }                       
        });
        
        removed.forEach((r) => {
            container.removeChild(r);
        });
        
        monsters.forEach((m) => {
            if (!container.querySelector('#id' + m.id)){
                let daMonster = document.createElement('div');
                daMonster.setAttribute('id', 'id' + m.id);
                daMonster.classList.add('da-monster')
                daMonster.innerHTML = '<div id="da-monster-point">' + m.point + '</div>';
                container.append(daMonster);
            }
        }) ;       
        
    }
    
    public pickAvailableMonster(){
        return new Promise((resolve, reject) =>{
            
            let monsters = this.shadowRoot.querySelectorAll('#da-monsters-left-container div'),
                selectFn = (monster) =>{
                    Array.from(monsters).forEach((m) => {
                        m.removeEventListener('click', selectFn);
                    });
                    let id = parseInt(monster.getAttribute('id').substring(2));                                                                                
                    resolve(id);
                };
            Array.from(monsters).forEach((m) =>{
                m.addEventListener('click', (e) =>{
                    selectFn(m);
                }); 
            })            
        })
    }
}

customElements.define(DaMonsterTable.is, DaMonsterTable);