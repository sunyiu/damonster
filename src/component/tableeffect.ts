"use strict";

import { rejects } from "assert";
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
    [content][invade] [loader].start{
      animation-name: loader;
      animation-timing-function: linear;
      animation-duration: 3.5s;
    }

    [content][action].show [background]{
      animation-name: action-on-background;
      animation-timing-function: ease-in;
      animation-duration: 0.3s;
    }
    [content][action].show [msg-container]{
      animation-name: action-on-msg;
      animation-timing-function: ease-in;
      animation-duration: 0.3s;
    }
    [content][action] [loader]{
      position: absolute;
      bottom: 0;
      height:10px;
      width: 100%;
      background-color: rgba(255,0,0,1);
      z-index: 999;          
    }
    [content][action].top [loader]{
      bottom: none;
      top: 0;
    }
    [content][action] [loader].hide{
      display: none;
    }
    [content][action] [loader].start{
      animation-name: loader;
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

  public cancelEffect() {
    this.dispatchEvent(
      new CustomEvent("cancel-effect", { bubbles: true, composed: true })
    );
  }

  public switchPlayer(isNPC: boolean): Promise<void> {
    const name = isNPC ? "npc" : "player";
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

    return new Promise((resolve, rejects) => {
      const animationCallback = () => {
        this._background.removeEventListener("webkitAnimationEnd", animationCallback);
        if (withLoader)
          this._loader.classList.add('start');        
         else{
           resolve();
         }
      };
      const loaderEnd = () =>{        
        this._loader.removeEventListener('webkitAnimationEnd', loaderEnd);        
        this.removeEventListener("cancel-effect", cancelCallback);
        this._content.removeAttribute("action");
        this._content.classList.remove("show");        
        this._isWaiting = false;        
        resolve();
      };
      const cancelCallback = () => {
        this._isWaiting = false;
        this._background.removeEventListener("webkitAnimationEnd", animationCallback);
        this._loader.removeEventListener('webkitAnimationEnd', loaderEnd);                
        this.removeEventListener("cancel-effect", cancelCallback);
        this._content.removeAttribute("action");
        this._content.classList.remove("show");
        this._isWaiting = false;
        rejects();
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
