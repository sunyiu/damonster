"use strict";
import { DaHeroTypes, DaActions, DaCardType, ICard_com_data } from './idamonster'
import Card_com, { Card_com_events } from "./card"
import Playerhero_com from "./playerhero"

export enum Player_com_events {
  SetHero = "set-hero",
  EquipHero = "equip-hero",
  DoAction = "do-action",
  SkipAction = "action-done",
  DoBattle = "do-battle"
}

const template = document.createElement('template');
template.innerHTML = `
<style>
    #da-player-container{
      position: absolute;
      display: flex;
      width: 100%;
    }
    #da-player-container[type='npc']{
      bottom: 15px;
      align-items: flex-end;
    }
    #da-player-container[type='player']{
      top: 15px;
      flex-direction: row-reverse;
      align-items: flex-start;
    }
    #da-player-container[type='npc'] da-monster-player-hero{
      padding-right: 25px;
    }
    #da-player-container[type='player'] da-monster-player-hero{
      padding-left: 25px;
    }    

    #hand-container{
        display: flex;
        flex-wrap: wrap;
        flex-grow: 1;
        overflow: hidden                  
    }
    #da-player-container[type='player'] #hand-container{
      flex-direction: row-reverse;
    }
    #da-player-container #hand-container da-card{
      transition: margin-right .5s ease-out, margin-left .5s ease-out; 
      margin-right: 0;
      margin-left: 0; 
    }
    #da-player-container[type='player'] #hand-container da-card.on-add{
      margin-right: -45px;
    }
    #da-player-container[type='npc'] #hand-container da-card.on-add{
      margin-left: -45px;
    }

    @media only screen and (max-width: 500px) {
    }
    
    
    button.hide{
        display: none;
    }
    
    
    #monster-container{
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
    }
    
    #monster-container div.monster{
        display: block;
        width: 25px;
        height: 25px;
        background-size: contain;
        background-image: url(images/monster.png);
        background-repeat: no-repeat;
    }                                                


</style>
<!-- shadow DOM for your element -->
<div id="da-player-container">
    <da-monster-player-hero></da-monster-player-hero>
    <div id="hand-container"></div>
    <div id="btns">
        <button id="playBtn" class="hide">PLAY</button>
        <button id="battleBtn" class="hide">FIGHT</button>
        <button id="actionBtn" class="hide">DONE</button>
    </div>
</div>
`;

export default class Player_com extends HTMLElement {

  private _hero: Playerhero_com;
  public get hero() {
    return this._hero;
  }

  private _shadowRoot: ShadowRoot;
  private _container: HTMLElement;
  private _isNPC: boolean;

  public constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this._container = this._shadowRoot.getElementById("da-player-container") as HTMLElement;
    this._hero = this._shadowRoot.querySelector('da-monster-player-hero') as Playerhero_com;

    const type = this.getAttribute('data-type');
    if (!type) {
      throw "Player type (data-type) is needed!!!!";
    }

    this._container.setAttribute('type', type);
    if (type == "npc") {
      this._isNPC = true;
      this._container.classList.add("npc");
      this._container.removeChild(this._shadowRoot.getElementById("btns") as HTMLElement);
    } else {
      this._isNPC = false;
      this._container.classList.remove("npc");
      this._shadowRoot.getElementById("playBtn")!.onclick = e => {
        const container = this._shadowRoot.getElementById("hand-container") as HTMLElement,
          card = Array.from(container.children).find((c: any) => {
            return c.isSelected;
          }) as Card_com;

        if (!card) {
          console.log("NOTHING is selected!!!!");
          return;
        }

        switch (card.cardType) {
          case DaCardType.Hero:
            this.dispatchEvent(
              new CustomEvent(Player_com_events.SetHero, {
                detail: { card: card },
                bubbles: true,
                composed: true
              })
            );
            break;

          case DaCardType.Action:
            this.dispatchEvent(
              new CustomEvent(Player_com_events.DoAction, {
                detail: { card: card },
                bubbles: true,
                composed: true
              })
            );
            break;

          case DaCardType.Item:
            this.dispatchEvent(
              new CustomEvent(Player_com_events.EquipHero, {
                detail: { card: card },
                bubbles: true,
                composed: true
              })
            );
            break;
        }
        //hide the play button
        (e.srcElement as HTMLElement).classList.add("hide");
      };

      this._shadowRoot.getElementById("battleBtn")!.onclick = e => {
        this.dispatchEvent(
          new CustomEvent(Player_com_events.DoBattle, {
            detail: null,
            bubbles: true,
            composed: true
          })
        );
        (e.srcElement as HTMLElement).classList.add("hide");
      };

      this._shadowRoot.getElementById("actionBtn")!.onclick = e => {
        this.dispatchEvent(
          new CustomEvent(Player_com_events.SkipAction, {
            detail: null,
            bubbles: true,
            composed: true
          })
        );
        (e.srcElement as HTMLElement).classList.add("hide");
      };
    }
  }

  public set isActionOn(value: any) {
    let btn = this._shadowRoot.getElementById("actionBtn");
    if (value) {
      btn!.classList.remove("hide");
    } else {
      btn!.classList.add("hide");
    }
  }

  public set isBattleOn(value: any) {
    let btn = this._shadowRoot.getElementById("battleBtn");
    if (value) {
      btn!.classList.remove("hide");
    } else {
      btn!.classList.add("hide");
    }
  }

  private toggleCard(card: any) {
    //deselect other
    let container = this._shadowRoot.getElementById("hand-container");
    Array.from(this._container.children).forEach(c => {
      let id = parseInt(c.getAttribute("data-id") as string);
      if (id != card.id) {
        (c as Card_com).isSelected = false;
      } else {
        (c as Card_com).isSelected = !(c as Card_com).isSelected;
        let playBtn = this._shadowRoot.getElementById("playBtn");
        if ((c as Card_com).isSelected) {
          playBtn!.classList.remove("hide");
        } else {
          playBtn!.classList.add("hide");
        }
      }
    });
  }

  initHand(cards: ICard_com_data[]) {
    cards.forEach(c => {
      const container = this._shadowRoot.getElementById("hand-container") as HTMLElement;
      let card = new Card_com();
      card.set(c);
      card.isFlip = !this._isNPC;

      if (!this._isNPC) {
        card.addEventListener(Card_com_events.Clicked, e => {
          this.toggleCard(card);
        });
      }
      container.appendChild(card);
    });
  }

  GetCardById(id: number): Card_com {
    let container = this._shadowRoot.getElementById("hand-container") as HTMLElement;
    return Array.from(container.children).find((c): boolean => {
      return c.id == id.toString();
    }) as Card_com;
  }

  public GetHandIds() {
    const container = this._shadowRoot.getElementById("hand-container") as HTMLElement;

    return Array.from(container.children).map(n => {
      return n.id;
    });
  }

  public addHand(daCard: Card_com): Promise<void> {
    const container = this._shadowRoot.getElementById("hand-container") as HTMLElement;
    daCard.classList.add('on-add')
    container.prepend(daCard);
    return new Promise((resolve, reject) => {
      const callback = (e: any) => {
        daCard.removeEventListener('webkitTransitionEnd', callback);
              resolve();
      };
      daCard.addEventListener('webkitTransitionEnd', callback);
      setTimeout(() => { 
        daCard.classList.remove('on-add');
      }, 50);
    });
  }

  removeHand(id: number): Promise<Card_com> {
    const container = this._shadowRoot.getElementById("hand-container") as HTMLElement;
    let daCard = Array.from(container.children).find(c => {
      return c.id == id.toString();
    }) as Card_com;

    if (!daCard) {
      console.log("CARD NOT IN HAND!!!!! cannot remove");
    }

    container.removeChild(daCard);
    return Promise.resolve(daCard);

    // return (daCard as Card_com)!.remove().then((): Card_com => {
    //   container.removeChild(daCard as HTMLElement);
    //   return daCard;
    // });
  }

  public setHero(hero?: { id: number; type: DaHeroTypes; point: number }): Promise<void>{
    if (!hero){
      return this.hero.empty();
    }

    const container = this._shadowRoot.getElementById("hand-container") as HTMLElement;
      let daCard = Array.from(container.children).find(c => {
      return c.id == hero.id.toString();
    }) as Card_com;
    if (!daCard){
      throw "CARD NOT IN HAND!!! cannot set hero";
    }

    let promise: Promise<void> = Promise.resolve();
    if (this._isNPC){
      promise = daCard.flip();
    }
    promise = promise.then(() => {
      return this.removeHand(hero.id).then((c) => {
        return this.hero.set(hero.type, 1)
      });
    });
    return promise;
  }

  public equip(cardId: number, flip: boolean): Promise<void> {
    const container = this._shadowRoot.getElementById("hand-container") as HTMLElement;
    let daCard = Array.from(container.children).find(c => {
      return c.id == cardId.toString();
    }) as Card_com;

    if (!daCard) {
      console.log("CARD NOT IN HAND!!!!! cannot remove");
    }

    let promise: Promise<void> = Promise.resolve();
    if (daCard.isFlip != flip) {
      promise = promise.then(() => { return daCard.flip(); });
    }

    return promise.then(() => {
      //highlight the card..... animation !!
      container.removeChild(daCard);
      return this.hero.equip();
    });
  }

  public EndAction() {
    // let playBtn = this._shadowRoot.getElementById('playBtn');
    // if (c.isSelected){
    //         playBtn!.classList.remove('hide');
    // }else{
    //     playBtn!.classList.add('hide');
    // }
  }

  public KillAMonster() {
    const container = this._shadowRoot.getElementById("monster-container") as HTMLElement;
    let monster = document.createElement("div");
    monster.classList.add("monster");
    container.append(monster);
    return Promise.resolve();
  }
}

customElements.define('da-monster-player', Player_com);
