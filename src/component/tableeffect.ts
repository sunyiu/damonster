"use strict";
import { DaActions } from "./idamonster";

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
    @keyframes loader{
      0% { transform: scaleX(0);}
      100% { transform: scaleX(1);}
    }
    
    @keyframes action-on-background{
      0% { transform: translateX(-100%);}
      100% { transform: translateX(0); }
    }
    @keyframes action-on-msg{
      0% { transform: translateX(100%);}
      100% { transform: translateX(0); }
    }
    @keyframes action-off-background{
      0% { transform: translateX(0);}
      100% { transform: translateX(100%); }
    }
    @keyframes action-off-msg{
      0% { transform: translateX(0);}
      100% { transform: translateX(-100%); }
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
        background-color: rgba(255,255,255,0.75);
    }
    [msg-container]{
        z-index: 99;
        background-color: rgba(255,255,255,0.75);
    }
    [msg]{
        position: absolute;
        width: 100%;        
        top: 50%;
        transform: perspective(1px) translateY(-50%);
        text-align: center;
    }
    [content] [loader]{
      position: absolute;
      width: 100%;
      background-color: rgba(255,0,0,0.8);
      z-index: 999;
      display: none;
    }
    [content] [loader].start{
      animation-name: loader;
      animation-timing-function: linear;
      animation-duration: 3.5s;
      display: block;
    }

    [content][switch-player].npc.show  [background],
    [content][switch-player].player.show  [msg-container]{
        animation-name: up-down;
        animation-timing-function: linear;
        animation-duration: 2.25s;
    }
    [content][switch-player].npc.show  [msg-container],
    [content][switch-player].player.show  [background]{
        animation-name: down-up;
        animation-timing-function: linear;
        animation-duration: 2.25s;
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
      top: 0;
      height: 100%;
    }

    [content][action].show [background]
    {
      animation-name: action-on-background;
      animation-timing-function: ease-in;
      animation-duration: 0.3s;
    }
    [content][action].show [msg-container]
    {
      animation-name: action-on-msg;
      animation-timing-function: ease-in;
      animation-duration: 0.3s;
    }
    [content][action].show.off [background]
    {
      animation-name: action-off-background;
      animation-timing-function: ease-in;
      animation-duration: 0.3s;
    }
    [content][action].show.off [msg-container]
    {
      animation-name: action-off-msg;
      animation-timing-function: ease-in;
      animation-duration: 0.3s;
    }
    [content][action] [loader]{
      bottom: 0;
      height:10px;     
    }
    [content][action].top [loader]{
      bottom: none;
      top: 0;
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
  private _isWaiting: boolean = false;
  public get isWaiting() {
    return this._isWaiting;
  }

  private _shadowRoot: ShadowRoot;
  private _content: HTMLElement;
  private _background: HTMLElement;
  private _msg: HTMLElement;
  private _loader: HTMLElement;

  public constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this._content = this._shadowRoot.querySelector("[content]") as HTMLElement;
    this._background = this._content.querySelector("[background]") as HTMLElement;
    this._msg = this._content.querySelector("[msg]") as HTMLElement;
    this._loader = this._content.querySelector('[loader]') as HTMLElement;
  }

  public cancelEffect(): Promise<void> {
    return new Promise(resolve => {
      this.dispatchEvent(
        new CustomEvent("cancel-effect", { detail: {resolve}, bubbles: true, composed: true })
      );
    });
  }

  public switchPlayer(isNPC: boolean): Promise<void> {
    const name = isNPC ? "npc" : "your";
    this._content.setAttribute("switch-player", "");
    this._msg.innerHTML = `${name}'s turn`.toUpperCase();
    return new Promise(resolve => {
      const callback = () => {
        this._content.removeAttribute("switch-player");
        this._content.className = "";
        this._background.removeEventListener("webkitAnimationEnd", callback);
        resolve();
      };
      this._background.addEventListener("webkitAnimationEnd", callback);
      this._content.classList.add("show", isNPC ? "npc" : "player");
    });
  }

  public actionStart(action: DaActions, withLoader: boolean, isLoaderTop?: boolean): Promise<void> {
    let name = "";
    switch (action) {
      case DaActions.AtomicBomb:
        name = "Atomic Bomob";
        break;
      case DaActions.Attack:
        name = "attack";
        break;
      case DaActions.MindReading:
        name = "mind reading";
        break;
      case DaActions.Provoke:
        name = "provoke";
        break;
      case DaActions.Radar:
        name = "radar";
        break;
      case DaActions.Retreat:
        name = "retreat";
        break;
      case DaActions.Steal:
        name = "steal";
        break;
      case DaActions.Stop:
        name = "stop";
        break;
    }
    this._isWaiting = true;
    this._content.setAttribute("action", "");
    this._msg.innerHTML = name;    
    this._loader.className = '';
    if (!withLoader){
      this._loader.classList.add('hide');
    }
    if (isLoaderTop){
      this._loader.classList.add('top');
    }

    return new Promise((resolve, reject) => {
      const animationCallback = () => {
        if (this._content.classList.contains('off')){
          this._isWaiting = false;
          this._background.removeEventListener("webkitAnimationEnd", animationCallback); 
          this._loader.removeEventListener('webkitAnimationEnd', loaderEnd);               
          this.removeEventListener("cancel-effect", cancelCallback);  
          this._content.removeAttribute("action");
          this._content.className = ''; 
          this._loader.className = '';
          resolve();
          return;
        }
        if (withLoader)
          this._loader.classList.add('start');        
         else
          setTimeout(() => {
            this._content.classList.add('off'); 
          }, 1000);
      };
      const loaderEnd = () =>{              
        this._content.classList.add('off');               
      };
      const cancelCallback = (e: any) => {
        this._isWaiting = false;
        this._background.removeEventListener("webkitAnimationEnd", animationCallback);
        this._loader.removeEventListener('webkitAnimationEnd', loaderEnd);               
        this.removeEventListener("cancel-effect", cancelCallback);
        this._content.removeAttribute("action");
        reject();
        setTimeout(() => {
          this._content.className = '';
          this._loader.className = '';
          e.detail.resolve();
        }, 200);
      };

      this._background.addEventListener("webkitAnimationEnd", animationCallback);
      if (withLoader) {this._loader.addEventListener('webkitAnimationEnd', loaderEnd);}
      this.addEventListener("cancel-effect", cancelCallback);
      
      this._content.classList.add("show");
    });
  }

  public monsterInvade(point: number): Promise<void> {
    this._isWaiting = true;
    this._content.setAttribute("invade", "");
    this._msg.innerHTML = "MONSTER INVADE";
    this._loader.className = '';
    return new Promise((resolve, rejects) => {
      const animationCallback = () => {
        this._background.removeEventListener("webkitAnimationEnd", animationCallback);
        this._loader.classList.add('start');        
      };
      const loaderEnd = () =>{        
        this._loader.removeEventListener('webkitAnimationEnd', loaderEnd);        
        this.removeEventListener("cancel-effect", cancelCallback);
        this._content.removeAttribute("invade");
        this._content.classList.remove("show");        
        this._isWaiting = false;        
        resolve();
      };
      const cancelCallback = () => {
        this._isWaiting = false;
        this._background.removeEventListener("webkitAnimationEnd", animationCallback);
        this._loader.removeEventListener('webkitAnimationEnd', loaderEnd);                
        this.removeEventListener("cancel-effect", cancelCallback);
        this._content.removeAttribute("invade");
        this._content.classList.remove("show");
        this._isWaiting = false;
        rejects();
      };

      this._background.addEventListener("webkitAnimationEnd", animationCallback);
      this._loader.addEventListener('webkitAnimationEnd', loaderEnd);
      this.addEventListener("cancel-effect", cancelCallback);
      
      this._content.classList.add("show");
    });
  }

  public doneBattle(winner: any) {
    return Promise.resolve();
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
