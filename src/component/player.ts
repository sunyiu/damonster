"use strict";
import { DaHeroTypes, DaActions, DaCardType, ICard_com_data } from './idamonster'
import Card_com, { Card_com_events } from "./card"
import Playerhero_com from "./playerhero"

export enum Player_com_events {
  SetHero = "set-hero",
  EquipHero = "equip-hero",
  DoAction = "do-action",
  //SkipAction = "action-done"
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

    [hand-container]{
        display: flex;
        flex-wrap: wrap;
        flex-grow: 1;
        overflow: hidden                  
    }
    #da-player-container[type='player'] [hand-container]{
      flex-direction: row-reverse;
    }
    #da-player-container [hand-container] da-card{
      transition: margin-right .5s ease-out, margin-left .5s ease-out; 
      margin-right: 0;
      margin-left: 0; 
    }
    #da-player-container[type='player'] [hand-container] da-card.on-add{
      margin-right: -45px;
    }
    #da-player-container[type='npc'] [hand-container] da-card.on-add{
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
    <div hand-container></div>
</div>
`;

export default class Player_com extends HTMLElement {

  private _hero: Playerhero_com;
  public get hero() {
    return this._hero;
  }

  public get hasStopCard(): boolean{
    return Array.from(this._hero.querySelectorAll('da-card')).some((c) => {
      const daCard = c as Card_com;
      return daCard.action && daCard.action == DaActions.Stop;
    })
  }

  private _shadowRoot: ShadowRoot;
  private _container: HTMLElement;
  private _handContainer: HTMLElement;
  private _isNPC: boolean;

  public constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this._container = this._shadowRoot.getElementById("da-player-container") as HTMLElement;
    this._handContainer = this._shadowRoot.querySelector("[hand-container]") as HTMLElement;
    this._hero = this._shadowRoot.querySelector('da-monster-player-hero') as Playerhero_com;

    const type = this.getAttribute('data-type');
    if (!type) {
      throw "Player type (data-type) is needed!!!!";
    }

    this._container.setAttribute('type', type);
    if (type == "npc") {
      this._isNPC = true;
      this._container.classList.add("npc");
    } else {
      this._isNPC = false;
      this._container.classList.remove("npc");
    }
  }

  //public onAction() {
    // const stopCard = this._handContainer.querySelector(`da-card[data-action="${DaActions.Stop}"`) as Card_com;
    // this._actionTimer = setTimeout(() => {
    //   this.dispatchEvent(
    //     new CustomEvent(Player_com_events.SkipAction, {detail: null, bubbles: true, composed: true})
    //   );
    // }, stopCard ? 5000: 1000);
  //}

  private cardClicked(card: Card_com) {
    //if card selected.. play the action
    if (card.hasAttribute('is-selected')){
      switch (card.cardType) {
        case DaCardType.Hero:
          this.dispatchEvent(
            new CustomEvent(Player_com_events.SetHero, {
              detail: { card: card },
              bubbles: true,
              composed: true
            })
          );
          return;

        case DaCardType.Action:
          this.dispatchEvent(
            new CustomEvent(Player_com_events.DoAction, {
              detail: { card: card },
              bubbles: true,
              composed: true
            })
          );
          return;

        case DaCardType.Item:
          this.dispatchEvent(
            new CustomEvent(Player_com_events.EquipHero, {
              detail: { card: card },
              bubbles: true,
              composed: true
            })
          );
          return;
      }
    }

    //deselect other
    this._handContainer.querySelectorAll('da-card[is-selected]').forEach(elem => {
      elem.removeAttribute('is-selected');
    });
    card.setAttribute('is-selected', 'selected');

    // let container = this._shadowRoot.getElementById("hand-container");
    // Array.from(this._container.children).forEach(c => {
    //   let id = parseInt(c.getAttribute("data-id") as string);
    //   if (id != card.id) {
    //     (c as Card_com).isSelected = false;
    //   } else {
    //     (c as Card_com).isSelected = !(c as Card_com).isSelected;
    //     let playBtn = this._shadowRoot.getElementById("playBtn");
    //     if ((c as Card_com).isSelected) {
    //       playBtn!.classList.remove("hide");
    //     } else {
    //       playBtn!.classList.add("hide");
    //     }
    //   }
    // });
  }

  initHand(cards: ICard_com_data[]) {
    cards.forEach(c => {
      let card = new Card_com();
      card.set(c);
      card.isFlip = !this._isNPC;

      if (!this._isNPC) {
        card.addEventListener(Card_com_events.clicked, e => {
          this.cardClicked(card);
        });
      }
      this._handContainer.appendChild(card);
    });
  }

  public GetCardById(id: number): Card_com {
    return this._handContainer.querySelector(`da-card[id="${id}"]`) as Card_com;
  }

  public GetHandIds() {
    return Array.from(this._handContainer.querySelectorAll('da-card')).map(n => {
      return n.id;
    })
  }

  public addHand(daCard: Card_com): Promise<void> {
    daCard.addEventListener(Card_com_events.clicked, () => {
      daCard.setAttribute('isSelected', 'isSelected');
    });
    daCard.setAttribute('card-size', 'normal');
    daCard.classList.add('on-add')
    this._handContainer.prepend(daCard);
    return new Promise((resolve, reject) => {
      const callback = (e: any) => {
        daCard.removeEventListener('webkitTransitionEnd', callback);
        resolve();
      };
      daCard.addEventListener('webkitTransitionEnd', callback);
      setTimeout(() => {
        daCard.classList.remove('on-add');
      }, 10);
    });
  }

  removeHand(id: number): Promise<Card_com> {
    let daCard = this._handContainer.querySelector(`da-card[id="${id}"]`) as Card_com;
    if (!daCard) {
      console.log("CARD NOT IN HAND!!!!! cannot remove");
    }

    this._handContainer.removeChild(daCard);
    return Promise.resolve(daCard);

    // return (daCard as Card_com)!.remove().then((): Card_com => {
    //   container.removeChild(daCard as HTMLElement);
    //   return daCard;
    // });
  }

  public setHero(hero?: { id: number; type: DaHeroTypes; point: number }): Promise<void> {
    if (!hero) {
      return this.hero.empty();
    }

    let daCard = this._handContainer.querySelector(`da-card[id="${hero.id}"]`) as Card_com;
    if (!daCard) {
      throw "CARD NOT IN HAND!!! cannot set hero";
    }

    let promise: Promise<void> = Promise.resolve();
    if (this._isNPC) {
      promise = daCard.flip();
    }
    promise = promise.then(() => {
      return this.removeHand(hero.id).then((c) => {
        return this.hero.set(hero.type, 1)
      });
    });
    return promise;
  }

  public equip(card: ICard_com_data): Promise<void> {
    let daCard = this._handContainer.querySelector(`da-card[id="${card.id}"]`) as Card_com;

    if (!daCard) {
      console.log("CARD NOT IN HAND!!!!! cannot remove");
    }


    return (this._isNPC ? daCard.flip() : Promise.resolve()).then(() =>{
      this._handContainer.removeChild(daCard);
      return this.hero.equip(daCard);
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
