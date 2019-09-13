"use strict";

const template = document.createElement("template");
template.innerHTML = `
<style> 
    @keyframes up-down{
        0% { transform: translateY(-100%);}
        15% { transform: translateY(0); }
        85% { transform: translateY(0); }
        100% { transform: translateY(100%); }
    }
    @keyframes down-up{
        0% { transform: translateY(100%);}
        15% { transform: translateY(0); }
        85% { transform: translateY(0); }
        100% { transform: translateY(-100%); }        
    }

    @keyframes invade-background{
      0% { transform: translateY(-100%);}
      100% { transform: translateY(0); }
    }
    @keyframes invade-msg{
      0% { transform: translateY(100%);}
      100% { transform: translateY(0); }
    }
    @keyframes invade-loader{
      5% { transform: scaleX(0);}
      100% { transform: scaleX(1);}
    }

    [container] {
        position: absolute;
        overflow: hidden;
        width: 100%;
        top: 0;
        bottom: 0;
        font-family: 'Bowlby One SC', cursive;    
        font-size: 50px;    
    }
        
    [content]{
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
        display: none;
    }
    [content].show{
      display: block;
    }
    
    [background], 
    [msg-container]{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;        
        /*-webkit-transition: all .4s ease-in-out;
        transition: all .4s ease-in-out;*/
        animation-fill-mode: forwards;
    }
    [background]{
        z-index: 1;
        background-color: rgba(0,0,0,0.8);
    }
    [msg-container]{
        z-index: 99;
        background-color: rgba(255,255,255,0.8);
    }
    [msg]{
        position: absolute;
        width: 100%;        
        top: 50%;
        transform: perspective(1px) translateY(-50%);
        text-align: center;
    }

    [content][switch-player].npc.show  [background],
    [content][switch-player].player.show  [msg-container]{
        animation-name: up-down;
        animation-timing-function: linear;
        animation-duration: 2.5s;
    }
    [content][switch-player].npc.show  [msg-container],
    [content][switch-player].player.show  [background]{
        animation-name: down-up;
        animation-timing-function: linear;
        animation-duration: 2.5s;
    }
    
    [content][invade] [background]{
      background-color: black;
    }
    [content][invade] [msg-container]{
      background-image: url(images/GodzillaSilhouetteT.png);
      background-repeat: no-repeat;
      background-size: contain;
      background-position: right 10px;
      background-color: inherit;
      color: white;
    }
    [content][invade].show  [background]{
        animation-name: invade-background;
        animation-timing-function: ease-in;
        animation-duration: 0.3s;
    }
    [content][invade].show  [msg-container]{
        animation-name: invade-msg;
        animation-timing-function: ease-in;
        animation-duration: 0.3s;
    }
    [content][invade] [loader]{
      position: absolute;
      bottom: 0;
      height: 100%;
      width: 100%;
      background-color: rgba(255,0,0,0.5);
      z-index: 999;
    }
    [content][invade].show [loader]{
      animation-name: invade-loader;
      animation-timing-function: linear;
      animation-duration: 3.5s;
    }


                                                                                                                                                                                        
</style>
<!-- shadow DOM for your element -->
<div container>    
    <div content>
        <div background></div>
        <div msg-container>
            <div msg></div>
        </div>
        <div loader></div>
    </div>
</div>
`;

export default class TableEffect_com extends HTMLElement {
  public static get observedAttributes(): string[] {
    return [];
  }

  private _shadowRoot: ShadowRoot;
  private _content: HTMLElement;
  public constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this._content = this._shadowRoot.querySelector("[content]") as HTMLElement;
  }

  public switchPlayer(isNPC: boolean): Promise<void> {
    const name = isNPC ? 'npc' : 'player';
    const background = this._content.querySelector("[background]") as HTMLElement;
    const msg = this._content.querySelector("[msg]") as HTMLElement;
    this._content.setAttribute('switch-player', '');
    msg.innerHTML = `${name}'s turn`.toUpperCase();
    return new Promise(resolve =>{
        const callback = () =>{
          this._content.removeAttribute('switch-player');
          this._content.className = '';
          background.removeEventListener('webkitAnimationEnd', callback);
          resolve();
        }
        background.addEventListener('webkitAnimationEnd', callback);
        this._content.classList.add('show', isNPC ? 'npc' : 'player');
    })
  }

  public actionStart(name: string): Promise<void>{
    return Promise.resolve();
  }

  public monsterInvade(point: number): Promise<void>{
    const background = this._content.querySelector("[background]") as HTMLElement;
    const msg = this._content.querySelector("[msg]") as HTMLElement;
    this._content.setAttribute('invade', '');
    msg.innerHTML = 'MONSTER INVADE';
    return new Promise(resolve =>{
        const callback = () =>{
          background.removeEventListener('webkitAnimationEnd', callback);
          resolve();
        }
        background.addEventListener('webkitAnimationEnd', callback);
        this._content.classList.add('show');
    })    
  }


  public doneBattle(winner: any) {
    return new Promise((resolve, reject) => {
      let content = this.shadowRoot!.getElementById("da-effect-content"),
        callback = (e: any) => {
          content!.removeEventListener("webkitAnimationEnd", callback);
          content!.innerHTML = "";
          content!.classList.remove("rollout_up");
          content!.classList.add("hide");
          resolve();
        };

      content!.addEventListener("webkitAnimationEnd", callback);
      content!.classList.add("rollout_up");
    });
  }

  //   public switchPlayer(player: any): Promise<void> {
  //     return new Promise((resolve, reject) => {
  //       let content = this.shadowRoot!.getElementById("da-effect-content"),
  //         callback = (e: any) => {
  //           content!.removeEventListener("webkitAnimationEnd", callback);
  //           content!.innerHTML = "";
  //           content!.classList.remove("rollinout_up");
  //           content!.classList.add("hide");
  //           resolve();
  //         };

  //       content!.innerHTML = player;
  //       content!.classList.remove("hide");
  //       content!.addEventListener("webkitAnimationEnd", callback);
  //       content!.classList.add("rollinout_up");
  //     });
  //   }
}

customElements.define("da-monster-table-effect", TableEffect_com);
