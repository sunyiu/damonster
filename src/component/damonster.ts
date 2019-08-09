"use strict";

//core
// import {DaMonsterGame} from '../core/game'
//import {DaMonsterGameEvents} from  '../core/game'
//import {DaActions} from '../core/actioncard'

//web component
import Deck_com from "./deck";
import { Deck_com_serve_direction, Deck_com_events } from "./deck";
import Player_com from "./player";
import TableEffect_com from "./tableeffect";
import Card_com from "./card";

export default class DaMonster_Com extends HTMLElement {
  public static get is(): string {
    return "da-monster";
  }

  public getTemplate(props: any): string {
    return `
            <style> 
                #table{
                    display: block;
                    position: relative;
                    padding: 20px;
                }
                
                da-monster-table-effect{
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 100%;
                    z-index: 100;
                    pointer-events: none;
                }
                
                da-monster-player{
                    display: block;
                    margin: 15px;
                    /*background-color: gray;*/
                }
                
                da-monster-deck {
                    text-align: center;
                }
			</style>
            <!-- shadow DOM for your element -->
            <div id="da-monster-container">
                <da-monster-player id='npc' data-type='npc'></da-monster-player>
                <div id="table">
                    <da-monster-deck id='deck'></da-monster-deck>
                    <da-monster-table-effect id='effect'></da-monster-table-effect>
                </div>
                <da-monster-player id='player' data-type='player'></da-monstr-player>                
            </div>
        `;
  }

  // public static get properties(){
  //     return{
  //     };
  // }

  // public static get observedAttributes(): string[] {
  //     const attributes: string[] = [];
  //     for (let key in DaMonster_Com.properties) {
  //         attributes.push(key.toLowerCase());
  //     }
  //     return attributes;
  // }

  private props: any = {};

  public constructor() {
    super();

    this.attachShadow({ mode: "open" });

    // Initialize declared properties
    // for (let key in DaMonster_Com.properties) {
    //     this.props[key] = DaMonster_Com.properties[key].value;
    // }

    this.requestRender();

    this.npc = this.shadowRoot!.getElementById("npc") as Player_com;
    this.player = this.shadowRoot!.getElementById("player") as Player_com;
    this.deck = this.shadowRoot!.getElementById("deck") as Deck_com;

    let tmp = new TableEffect_com(); //!!!need this to load tableeffect component js...!!!
    this.effect = this.shadowRoot!.getElementById("effect") as TableEffect_com;
  }

  private requestRender(): void {
    const template: HTMLTemplateElement = <HTMLTemplateElement>(
      document.createElement("template")
    );

    template.innerHTML = this.getTemplate({});

    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }

  //-------------------------------------------------------------------------------
  npc: Player_com;
  player: Player_com;
  deck: Deck_com;
  effect: TableEffect_com;
  private animation: Promise<void | void[]> = Promise.resolve();

  playerHeroSet(
    isNPC: boolean,
    hero?: { id: number; type: string; point: number }
  ): void {
    let player = isNPC ? this.npc : this.player;
    if (!hero) {
      this.animation = this.animation.then(() => {
        player.hero.Empty();
      });
      return;
    }
    this.animation = this.animation
      .then(() => {
        return player.RemoveHand(hero!.id);
      })
      .then(() => {
        return hero
          ? player.hero.Set(hero!.type, hero!.point)
          : player.hero.Empty();
      });
  }

  playerEquipHero(
    isNPC: boolean,
    card: { id: number; point: number; cardType: string; heroType: string }
  ): void {
    let player = isNPC ? this.npc : this.player;
    this.animation = this.animation
      .then(() => {
        return player.RemoveHand(card.id);
      })
      .then(() => {
        return player.hero.Equip(
          card.id,
          card.point,
          card.cardType,
          card.heroType
        );
      });
  }

  playerAddCardFromDeck(
    isNPC: boolean,
    card: {
      id: number;
      point: number;
      cardType: string;
      heroType: string;
      action: string;
    }
  ) {
    let player = isNPC ? this.npc : this.player;
    this.animation = this.animation
      .then(() => {
        return this.deck!.Serve(
          card.id,
          card.point,
          card.cardType,
          card.heroType,
          card.action,
          isNPC
            ? Deck_com_serve_direction.Up
            : Deck_com_serve_direction.DownAndFlip
        );
      })
      .then(daCard => {
        return player.AddHand(daCard);
      });
  }

  switchToPlayer(isNPC: boolean) {
    let to = isNPC ? this.npc : this.player,
      from = isNPC ? this.player : this.npc;
    this.animation = this.animation
      .then(() => {
        return this.effect!.switchPlayer(isNPC ? "NPC" : "Player");
      })
      .then(() => {
        to.hero.isActive = true;
        from.hero.isActive = false;
        return Promise.resolve();
      });
  }

  monstrInvade(
    id: number,
    point: number,
    type: string,
    heroType: string,
    action: string
  ) {
    this.animation = this.animation
      .then(() => {
        return this.deck.Serve(
          id,
          point,
          type,
          heroType,
          action,
          Deck_com_serve_direction.Flip
        );
      })
      .then(() => {
        return this.effect.monsterInvade(point);
      })
      .then(() => {
        this.player.isBattleOn = true;
        return Promise.resolve();
      });
  }

  battleDone(
    winner: "player" | "npc" | "monster",
    monsterId: number,
    monsterPoint: number,
    isActivePlayerNPC: boolean
  ) {
    this.player!.isBattleOn = false;
    if (winner != "monster") {
      let player = winner == "npc" ? this.npc : this.player;
      this.animation = this.animation
        .then(() => {
          return this.effect.doneBattle(player);
        })
        .then(() => {
          return this.deck.RemoveTop();
        })
        .then(() => {
          console.log("com::damonster -- kill a monster");
          return player.KillAMonster();
        });
    } else {
      this.animation = this.animation.then(() => {
        let promises = [];
        promises.push(this.deck.AddAVailableMonster(monsterId, monsterPoint));
        promises.push(this.player.hero.Empty());
        promises.push(this.npc.hero.Empty());
        return Promise.all(promises);
      });
    }
    this.animation = this.animation.then(() => {
      return this.switchToPlayer(!isActivePlayerNPC);
    });
  }

  actionStart(isNPC: boolean, cardId: number) {
    if (isNPC) {
      let daCard = this.npc.GetCardById(cardId);
      this.animation = this.animation
        .then(() => {
          return daCard.flip();
        })
        .then(() => {
          this.player.isActionOn = true;
        });
    }
  }

  actionDone(
    cards: { id: number; isNPC: boolean }[],
    action: {
      id: number; //action id
      cardId: number; //action card id
      isStopped: boolean; //is action stopped
      isNPC: boolean; //is action played by NPC
      args: {
        cardIds?: number[];
        card?: {
          id: number;
          point: number;
          type: string;
          heroType: string;
          action: string;
        };
        winner?: "player" | "npc";
      };
    }
  ) {
    this.player.isActionOn = false;

    //remove all played card
    this.animation = this.animation.then(() => {
      let cardRemovalPromises: any[] = [];
      cards.forEach((r: { id: number; isNPC: boolean }) => {
        let player = r.isNPC ? this.npc : this.player;
        cardRemovalPromises.push(player.RemoveHand(r.id));
      });
      return Promise.all(cardRemovalPromises);
    });

    //show the result
    if (!action.isStopped) {
      let promises: any[] = [];
      //let player = action.isNPC ? this.npc : this.player;

      switch (action.id) {
        // AtomicBomb - 0
        // Stop - 1
        // Radar - 2
        // Steal - 3
        // Retreat - 4
        // Provoke -5
        // Attack - 6
        // SuicideBelt - 7
        // MindReading - 8
        case 3:
          //let index = action.args[0];
          if (!action.args.card) {
            throw new Error("No card in the action STEAL");
          }
          this.animation = this.animation.then(() => {
            let daCard = new Card_com(),
              from = action.isNPC ? this.npc : this.player,
              to = action.isNPC ? this.player : this.npc,
              card = action.args.card!;
            daCard.Set(
              card.id,
              card.point,
              card.type,
              card.heroType,
              card.action,
              false
            );
            promises.push(from.AddHand(daCard));
            promises.push(to.RemoveHand(action.cardId));
            return Promise.all(promises);
          });
          break;

        case 2:
          this.animation = this.animation.then(() => {
            promises.push(this.deck.ShowNCard(action.args.cardIds!));
            return Promise.all(promises);
          });

          break;

        case 0:
          this.animation = this.animation.then(() => {
            promises.push(this.player.hero.Empty());
            promises.push(this.npc.hero.Empty());
            if (action.args.card) {
              promises.push(this.deck.RemoveTop());
              let player = action.isNPC ? this.npc : this.player;
              promises.push(player.KillAMonster());
            }

            //cancel battle if there is any...
            this.player.isBattleOn = false;

            return Promise.all(promises);
          });
          break;

        case 6:
          this.animation = this.animation.then(() => {
            if (!action.args.winner) {
              promises.push(this.player.hero.Empty());
              promises.push(this.npc.hero.Empty());
            } else {
              promises.push(
                action.args.winner == "npc"
                  ? this.player.hero.Empty()
                  : this.npc.hero.Empty()
              );
            }
            return Promise.all(promises);
          });
          break;
      }

      this.animation = this.animation.then(() => {
        return this.delayForNSec();
      });
    }
  }

  delayForNSec(sec?: number) {
    this.animation = this.animation.then(() => {
      return new Promise((resolve, reject) => {
        setTimeout(
          function() {
            resolve();
          },
          sec ? sec * 1000 : 500
        );
      });
    });
  }
}

customElements.define(DaMonster_Com.is, DaMonster_Com);
