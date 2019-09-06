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
        display: block;
        position: relative;
    }
    
    da-monster-player-hero{
        display: block;
        padding: 5px;
        background-color: #33658A;
        padding-bottom: 10px;
        border-bottom: 1px solid #e5efff;
        border-radius: 15px 15px 0 0;
    }
    #da-player-container.npc da-monster-player-hero{
        background-color: #F26419;       
        border-bottom: 1px solid #ffe7db;             
    }

    #hand-container{
        display: flex;
        flex-wrap: wrap;
        padding: 5px;                    
    }
    #hand-container, 
    #btns{
        background-color: #86BBD8;
    }
    #btns{
        border-radius: 0 0 15px 15px;
    }
    #da-player-container.npc #hand-container{
        background-color: #a03b04;
        border-radius: 0 0 15px 15px;                    
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
    <div id="monster-container"></div>
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
  public get hero(){
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

  InitHand(cards: ICard_com_data[], isFlip: boolean) {
    cards.forEach(c => {
      const container = this._shadowRoot.getElementById("hand-container") as HTMLElement;
      let card = new Card_com();
      card.set(c);
      card.isFlip = isFlip;

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
    return Array.from(container.children).find( (c): boolean => {
      return c.id == id.toString();
    }) as Card_com;
  }

  public GetHandIds() {
    const container = this._shadowRoot.getElementById("hand-container") as HTMLElement;

    return Array.from(container.children).map(n => {
      return n.id;
    });
  }

  AddHand(daCard: Card_com): Promise<void> {
    const container = this._shadowRoot.getElementById("hand-container") as  HTMLElement;
    container.prepend(daCard);

    return daCard.add(!this._isNPC).then(() => {
      if (!this._isNPC) {
        daCard.addEventListener(Card_com_events.Clicked, e => {
          this.toggleCard(daCard);
        });
      }
    });
  }

  RemoveHand(id: number): Promise<Card_com> {
    const container = this._shadowRoot.getElementById("hand-container") as HTMLElement;
    let daCard = Array.from(container.children).find(c => {
        return c.id == id.toString();
      }) as Card_com;

    if (!daCard) {
      console.log("CARD NOT IN HAND!!!!! cannot remove");
    }

    return (daCard as Card_com)!.remove().then((): Card_com => {
      container.removeChild(daCard as HTMLElement);
      return daCard;
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

  // public EquipHero(point) {
  //     return this._hero.Equip(point);
  // }

  // public ShowCard(id){
  //     let container = this._shadowRoot.getElementById('hand-container'),
  //         daCard = Array.from(container.children).find((c) => { return c.id == id;});
  //     if (!daCard){
  //         console.log('CARD NOT IN HAND!!!!');
  //     }
  //
  //     return daCard.flip();
  //
  //     // return this._animation = new Promise((resolve, reject) => {
  //     //     //only one direction because it should be called by NPC playing an action
  //     //     return daCard.flip().then(() =>{
  //     //         let animation = daCard.animate(
  //     //             [   {'marginTop': 0},
  //     //                 {'marginTop': '15px'}
  //     //             ],
  //     //             {   duration: 500,
  //     //                 iterations: 1,
  //     //                 //startDelay: 1000
  //     //                 //endDelay: 500
  //     //             }
  //     //         );
  //     //         animation.onfinish = (e) =>{
  //     //             resolve();
  //     //         };
  //     //     });
  //     // });
  // }
}

customElements.define('da-monster-player', Player_com);
