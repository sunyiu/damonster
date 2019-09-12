"use strict";

const template = document.createElement("template");
template.innerHTML = `
<style> 
    @keyframes up-down{
        0% { transform: translateY(-100%);}
        40% { transform: translateY(0); }
        50% { transform: translateY(0); }
        100% { transform: translateY(100%); }
    }
    @keyframes down-up{
        0% { transform: translateY(100%);}
        40% { transform: translateY(0); }
        50% { transform: translateY(0); }
        100% { transform: translateY(-100%); }        
    }

    [container] {
        position: absolute;
        overflow: hidden;
        width: 100%;
        top: 0;
        bottom: 0;
        font-family: 'Bowlby One SC', cursive;        
    }
        
    [content]{
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
        display: none;
    }
    
    [background], 
    [msg-container]{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;        

        /*-webkit-transition: all .4s ease-in-out;
        transition: all .4s ease-in-out;*/
        animation-duration: 1s;
        animation-fill-mode: forwards;
    }
    [background]{
        z-index: 1;
        background-color: white;
    }
    [msg-container]{
        z-index: 99;
    }
    [msg]{
        position: absolute;
        width: 100%;        
        top: 50%;
        transform: perspective(1px) translateY(-50%);
        text-align: center;
    }

    [content].show{
        display: block;
    }
    [content][switch-player].show  [background]{
        animation-name: up-down;
        animation-timing-function: linear;
    }
    [content][switch-player].show  [msg-container]{
        animation-name: up-down;
        animation-timing-function: linear;
    }    

                                                                                                                                                                                        
</style>
<!-- shadow DOM for your element -->
<div container>    
    <div content switch-player>
        <div background></div>
        <div msg-container>
            <div msg></div>
        </div>
    </div>
</div>
`;

export default class TableEffect_com extends HTMLElement {
  public static get observedAttributes(): string[] {
    return [];
  }

  private _shadowRoot: ShadowRoot;
  private _switchPlayerContent: HTMLElement;
  public constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this._switchPlayerContent = this._shadowRoot.querySelector("[switch-player]") as HTMLElement;
  }

  public switchPlayer(name: string): Promise<void> {
    const background = this._switchPlayerContent.querySelector("[background]") as HTMLElement;
    const msg = this._switchPlayerContent.querySelector("[msg]") as HTMLElement;
    msg.innerHTML = `${name}'s turn`.toUpperCase();
    return new Promise(resolve =>{
        const callback = () =>{
            background.removeEventListener('webkitTransitionEnd', callback);
            resolve();
        }
        background.addEventListener('webkitTransitionEnd', callback);
        this._switchPlayerContent.classList.add('show');
    })
  }

  public monsterInvade(point: any) {
    return new Promise((resolve, reject) => {
      let content = this.shadowRoot!.getElementById("da-effect-content"),
        callback = (e: any) => {
          content!.removeEventListener("webkitAnimationEnd", callback);
          content!.classList.remove("rollin_up");
          resolve();
        };
      content!.innerHTML = "(" + point + ")";

      content!.addEventListener("webkitAnimationEnd", callback);
      content!.classList.remove("hide");
      content!.classList.add("rollin_up");
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
