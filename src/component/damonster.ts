"use strict";
import Deck_com, { Deck_com_serve_direction, Deck_com_events } from "./deck";
import Player_com, { Player_com_events } from "./player";
import TableEffect_com from "./tableeffect";
import { DaHeroTypes, DaActions, DaCardType } from './idamonster'
import Card_com from "./card";
import { damonster_events, IDaMonster_Com, ICard_com_data } from "./idamonster";

export default class DaMonster_Com extends HTMLElement
  implements IDaMonster_Com {
  public static get is(): string {
    return "da-monster";
  }

  public getTemplate(): string {
    return `
            <style>
                div[da-monster-container]{
                  height: 100%;
                  position: relative;
                  display: flex;
                  flex-direction: column;
                } 
                #table{
                    display: block;
                    position: relative;
                    height: 150px;
                    flex-shrink: 0;
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
                    /*margin: 15px;
                    background-color: gray;*/
                    flex-grow: 1;
                    position: relative;
                }
                da-monster-player[data-type='npc']{
                  background-color: #F26419;
                }
                da-monster-player[data-type='player']{
                  background-color: #86BBD8;
                }
                
                da-monster-deck {
                    text-align: center;
                    height: 100%;
                    display: block;
                }
			</style>
            <!-- shadow DOM for your element -->
            <div da-monster-container>
                <da-monster-player id='npc' data-type='npc'></da-monster-player>
                <div id="table">
                    <da-monster-deck id='deck'></da-monster-deck>
                    <da-monster-table-effect></da-monster-table-effect>
                </div>
                <da-monster-player id='player' data-type='player'></da-monstr-player>                
            </div>
        `;
  }

  public constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.requestRender();

    this.npc = this.shadowRoot!.getElementById("npc") as Player_com;
    this.player = this.shadowRoot!.getElementById("player") as Player_com;
    this.player.addEventListener(Player_com_events.SetHero, (e: any) => {
      this.dispatchEvent(
        new CustomEvent(damonster_events.PlayerSetHero, {
          detail: e.detail,
          bubbles: true,
          composed: true
        })
      );
    });
    this.player.addEventListener(Player_com_events.EquipHero, (e: any) => {
      this.dispatchEvent(
        new CustomEvent(damonster_events.PlayerEquipHero, {
          detail: e.detail,
          bubbles: true,
          composed: true
        })
      );
    });
    this.player.addEventListener(Player_com_events.DoAction, (e: any) => {
      this.dispatchEvent(
        new CustomEvent(damonster_events.PlayerDoAction, {
          detail: e.detail,
          bubbles: true,
          composed: true
        })
      );
    });
    this.player.addEventListener(Player_com_events.DoBattle, (e: any) => {
      this.dispatchEvent(
        new CustomEvent(damonster_events.PlayerDoBattle, {
          detail: e.detail,
          bubbles: true,
          composed: true
        })
      );
    });
    this.player.addEventListener(Player_com_events.SkipAction, (e: any) => {
      this.dispatchEvent(
        new CustomEvent(damonster_events.PlayerSkipAction, {
          detail: e.detail,
          bubbles: true,
          composed: true
        })
      );
    });

    this.deck = this.shadowRoot!.getElementById("deck") as Deck_com;
    this.deck.addEventListener(Deck_com_events.Draw, e => {
      this.dispatchEvent(
        new CustomEvent(damonster_events.DeckDraw, {
          detail: null,
          bubbles: false,
          composed: true
        })
      );
    });

    this.effect = this.shadowRoot!.querySelector("da-monster-table-effect") as TableEffect_com;
  }

  private requestRender(): void {
    const template: HTMLTemplateElement = <HTMLTemplateElement>(
      document.createElement("template")
    );

    template.innerHTML = this.getTemplate();

    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }

  //-------------------------------------------------------------------------------
  private npc: Player_com;
  private player: Player_com;
  private deck: Deck_com;
  private effect: TableEffect_com;
  private animation: Promise<void> = Promise.resolve();

  public initHand(npcCards: ICard_com_data[], playerCards: ICard_com_data[]) {
    this.npc.initHand(npcCards);
    this.player.initHand(playerCards);
  }

  playerHeroSet(isNPC: boolean, hero?: { id: number; type: DaHeroTypes; point: number }): Promise<void> {
    let player = isNPC ? this.npc : this.player;
    if (!hero) {
      return this.animation = this.animation.then(() => {
        player.hero.empty();
      });
    }
    return this.animation = this.animation.then(() =>{
      return player.setHero(hero);
    })
  }

  playerEquipHero(isNPC: boolean, card: ICard_com_data): Promise<void> {
    let player = isNPC ? this.npc : this.player;
    return this.animation = this.animation
      .then(() => {
        return player.equip(card.id);
      });
  }

  playerAddCardFromDeck(isNPC: boolean, card: ICard_com_data):Promise<void> {
    let player = isNPC ? this.npc : this.player;
    return this.animation = this.animation
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
        return player.addHand(daCard)
      });
  }

  public switchToPlayer(isNPC: boolean): Promise<void> {
    let to = isNPC ? this.npc : this.player,
      from = isNPC ? this.player : this.npc;
    return this.animation = this.animation.then(() => {
      return this.effect!.switchPlayer(isNPC ? "NPC" : "Player").then(() => {
        to.hero.isActive = true;
        from.hero.isActive = false;
      });
    });
  }

  monsterInvade(id: number, point: number, type: string, heroType: string, action: string): Promise<void> {
    return this.animation = this.animation
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

  battleDone(winner: "player" | "npc" | "monster", monsterId: number, monsterPoint: number): Promise<void> {
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
      return this.animation = this.animation.then(() => {
        let promises = [];
        promises.push(this.deck.AddAVailableMonster(monsterId, monsterPoint));
        promises.push(this.player.hero.empty());
        promises.push(this.npc.hero.empty());
        return Promise.all(promises).then(() =>{
          return Promise.resolve();
        });
      });
    }
    return this.animation;
  }

  actionStart(isNPC: boolean, cardId: number): Promise<void> {
    if (isNPC) {
      let daCard = this.npc.GetCardById(cardId);
      return this.animation = this.animation
        .then(() => {
          return daCard.flip();
        })
        .then(() => {
          this.player.onAction();
          return Promise.resolve();
        });
    }
    return Promise.resolve();
  }

  actionDone(action: DaActions, cards: { id: number; isNPC: boolean }[], isStopped: boolean, ...args: any[]): Promise<void> {
    //remove all played card
    this.animation = this.animation.then(() => {
      let cardRemovalPromises: any[] = [];
      cards.forEach((r: { id: number; isNPC: boolean }) => {
        let player = r.isNPC ? this.npc : this.player;
        cardRemovalPromises.push(player.removeHand(r.id));
      });
      return Promise.all(cardRemovalPromises);
    }).then(() =>{
      return Promise.resolve();
    });

    //show the result
    if (!isStopped) {
      switch (action) {
        case DaActions.Steal:
          if (!args || args.length < 1) {
            throw new Error("No card in the action STEAL");
          }
          let start = args[0].isNPC ? this.npc : this.player,
          target = args[0].isNPC ? this.player : this.npc,
          cardId = args[0].cardId;
          this.animation = this.animation.then(() => {
            return target.removeHand(cardId).then((c) =>{
                return start.addHand(c);
            })
          });
          break;

        case 2:
          //this.animation = this.animation.then(() => {
          //   promises.push(this.deck.ShowNCard(action.args!.cardIds!));
          //   return Promise.all(promises);
          // });

          break;

        case 0:
          // this.animation = this.animation.then(() => {
          //   promises.push(this.player.hero.empty());
          //   promises.push(this.npc.hero.empty());
          //   if (action.args!.card) {
          //     promises.push(this.deck.RemoveTop());
          //     let player = action.isNPC ? this.npc : this.player;
          //     promises.push(player.KillAMonster());
          //   }

          //   //cancel battle if there is any...
          //   this.player.isBattleOn = false;

          //   return Promise.all(promises);
          // });
          break;

        case 6:
          // this.animation = this.animation.then(() => {
          //   if (action.args!.winner == "none") {
          //     promises.push(this.player.hero.empty());
          //     promises.push(this.npc.hero.empty());
          //   } else {
          //     promises.push(
          //       action.args!.winner == "npc"
          //         ? this.player.hero.empty()
          //         : this.npc.hero.empty()
          //     );
          //   }
          //   return Promise.all(promises);
          // });
          break
      }
    }
    return this.animation;
  }
}

customElements.define(DaMonster_Com.is, DaMonster_Com);
