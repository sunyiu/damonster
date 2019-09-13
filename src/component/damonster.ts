"use strict";
import _deck_com, { Deck_com_serve_direction, Deck_com_events } from "./deck";
import _player_com, { Player_com_events } from "./player";
import Table_effect_com from "./tableeffect";
import { DaHeroTypes, DaActions, DaCardType } from './idamonster'
import Card_com from "./card";
import { damonster_events, IDaMonster_Com, ICard_com_data } from "./idamonster";
import Player_com from "./player";

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
                    height: 200px;
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

    this._npc = this.shadowRoot!.getElementById("npc") as _player_com;
    this._player = this.shadowRoot!.getElementById("player") as _player_com;
    this._player.addEventListener(Player_com_events.SetHero, (e: any) => {
      this.dispatchEvent(
        new CustomEvent(damonster_events.PlayerSetHero, {
          detail: e.detail,
          bubbles: true,
          composed: true
        })
      );
    });
    this._player.addEventListener(Player_com_events.EquipHero, (e: any) => {
      this.dispatchEvent(
        new CustomEvent(damonster_events.PlayerEquipHero, {
          detail: e.detail,
          bubbles: true,
          composed: true
        })
      );
    });
    this._player.addEventListener(Player_com_events.DoAction, (e: any) => {
      this.dispatchEvent(
        new CustomEvent(damonster_events.PlayerDoAction, {
          detail: e.detail,
          bubbles: true,
          composed: true
        })
      );
    });
    this._deck = this.shadowRoot!.getElementById("deck") as _deck_com;
    this._deck.addEventListener(Deck_com_events.Draw, () => {
      this.dispatchEvent(
        new CustomEvent(damonster_events.DeckDraw, {
          detail: null,
          bubbles: false,
          composed: true
        })
      );
    });

    this._effect = this.shadowRoot!.querySelector("da-monster-table-effect") as Table_effect_com;
  }

  private requestRender(): void {
    const template: HTMLTemplateElement = <HTMLTemplateElement>(
      document.createElement("template")
    );

    template.innerHTML = this.getTemplate();

    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }

  //-------------------------------------------------------------------------------
  private _npc: _player_com;
  private _player: _player_com;
  private _deck: _deck_com;
  private _effect: Table_effect_com;
  private _animation: Promise<void> = Promise.resolve();

  public initHand(npcCards: ICard_com_data[], playerCards: ICard_com_data[]) {
    this._npc.initHand(npcCards);
    this._player.initHand(playerCards);
  }

  playerHeroSet(isNPC: boolean, hero?: { id: number; type: DaHeroTypes; point: number }): Promise<void> {
    let _player = isNPC ? this._npc : this._player;
    if (!hero) {
      return this._animation = this._animation.then(() => {
        _player.hero.empty();
      });
    }
    return this._animation = this._animation.then(() =>{
      return _player.setHero(hero);
    })
  }

  playerEquipHero(isNPC: boolean, card: ICard_com_data): Promise<void> {
    let _player = isNPC ? this._npc : this._player;
    return this._animation = this._animation
      .then(() => {
        return _player.equip(card);
      });
  }

  playerAddCardFromDeck(isNPC: boolean, card: ICard_com_data):Promise<void> {
    let _player = isNPC ? this._npc : this._player;
    return this._animation = this._animation
      .then(() => {
        return this._deck!.Serve(
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
        return _player.addHand(daCard)
      });
  }

  public switchToPlayer(isNPC: boolean): Promise<void> {
    let to = isNPC ? this._npc : this._player,
      from = isNPC ? this._player : this._npc;
    return this._animation = this._animation.then(async () => {
      await this._effect!.switchPlayer(isNPC);
      to.hero.isActive = true;
      from.hero.isActive = false;
    });
  }

  monsterInvade(id: number, point: number, type: string, heroType: string, action: string): Promise<void> {
    return this._animation = this._animation
      .then(() => {
        return this._deck.Serve(
          id,
          point,
          type,
          heroType,
          action,
          Deck_com_serve_direction.Flip
        );
      })
      .then(() => {
        let promise = this._effect.monsterInvade(point);
        promise.then(() =>{
          this.dispatchEvent(
            new CustomEvent(damonster_events.Battle, {
              detail: null,
              bubbles: true,
              composed: true
            })
          );    
        });
        promise.catch(() => {
          //battle has been focsed to stop.... 
          //and will be battle will be started by the core logic... (after the action)
        });
      });
  }

  battleDone(winner: "player" | "npc" | "monster", monsterId: number, monsterPoint: number): Promise<void> {
    if (winner != "monster") {
      let _player = winner == "npc" ? this._npc : this._player;
      this._animation = this._animation
        .then(() => {
          return this._effect.doneBattle(_player);
        })
        .then(() => {
          return this._deck.RemoveTop();
        })
        .then(() => {
          console.log("com::damonster -- kill a monster");
          return _player.KillAMonster();
        });
    } else {
      return this._animation = this._animation.then(() => {
        let promises = [];
        promises.push(this._deck.AddAVailableMonster(monsterId, monsterPoint));
        promises.push(this._player.hero.empty());
        promises.push(this._npc.hero.empty());
        return Promise.all(promises).then(() =>{
          return Promise.resolve();
        });
      });
    }
    return this._animation;
  }

  actionStart(isNPC: boolean, cardId: number): Promise<void> {
    if (this._effect.isWaiting){
      this._effect.cancelEffect();
    }
    const daCard = isNPC ? this._npc.GetCardById(cardId) : this._player.GetCardById(cardId) as Card_com;
    if (!daCard.action) {
      throw "ACTION IS NOT DEFINED IN ACTION CARD!!!!";
    }

    if (isNPC){
      return this._animation = this._animation.then(() =>{
        return daCard.flip();
      }).then(() => {
        return this._effect.actionStart(daCard.action!, this._player.hasStopCard, false);
      }).then(() => {
        this.dispatchEvent(
          new CustomEvent(damonster_events.PlayerSkipAction, {
            detail: null,
            bubbles: true,
            composed: true
          })
        );  
      });
    }
    
    return this._effect.actionStart(daCard.action, true, true);
  }
  
  actionDone(action: DaActions, cards: { id: number; isNPC: boolean }[], isStopped: boolean, ...args: any[]): Promise<void> {
    //remove all played card
    this._animation = this._animation.then(() => {
      let cardRemovalPromises: any[] = [];
      cards.forEach((r: { id: number; isNPC: boolean }) => {
        let _player = r.isNPC ? this._npc : this._player;
        cardRemovalPromises.push(_player.removeHand(r.id));
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
          const start: Player_com = args[0].isNPC ? this._npc : this._player,
            target: Player_com = args[0].isNPC ? this._player : this._npc,
            cardId = args[0].cardId;
          
            this._animation = this._animation.then(() => {
            return target.removeHand(cardId).then((c: Card_com) =>{
                return start.addHand(c);
            })
          });
          break;

        case 2:
          //this._animation = this._animation.then(() => {
          //   promises.push(this._deck.ShowNCard(action.args!.cardIds!));
          //   return Promise.all(promises);
          // });

          break;

        case 0:
          // this._animation = this._animation.then(() => {
          //   promises.push(this._player.hero.empty());
          //   promises.push(this._npc.hero.empty());
          //   if (action.args!.card) {
          //     promises.push(this._deck.RemoveTop());
          //     let _player = action.isNPC ? this._npc : this._player;
          //     promises.push(_player.KillAMonster());
          //   }

          //   //cancel battle if there is any...
          //   this._player.isBattleOn = false;

          //   return Promise.all(promises);
          // });
          break;

        case 6:
          // this._animation = this._animation.then(() => {
          //   if (action.args!.winner == "none") {
          //     promises.push(this._player.hero.empty());
          //     promises.push(this._npc.hero.empty());
          //   } else {
          //     promises.push(
          //       action.args!.winner == "npc"
          //         ? this._player.hero.empty()
          //         : this._npc.hero.empty()
          //     );
          //   }
          //   return Promise.all(promises);
          // });
          break
      }
    }
    return this._animation;
  }
}

customElements.define(DaMonster_Com.is, DaMonster_Com);
