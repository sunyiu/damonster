'use strict';
export default class DaPlayer extends HTMLElement {
    constructor() {
        super();
        this.props = {};
        this.attachShadow({ mode: 'open' });
        // Initialize declared properties
        for (let key in DaPlayer.properties) {
            this.props[key] = DaPlayer.properties[key].value;
        }
        this.requestRender();
    }
    static get is() { return 'da-player'; }
    getTemplate(props) {
        return `
            <style>
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-player-container">
                <div id="da-hero-container"><span>HERO::</span><span id="hero-context"></span></div>            
                <div id="da-hand-container"><span>HAND::</span><span id="hand-context"></span></div>
            </div>
        `;
    }
    static get properties() {
        return {
            'data-hand': {
                type: String,
                value: ''
            },
            'data-hero': {
                type: String,
                value: ''
            }
        };
    }
    static get observedAttributes() {
        const attributes = [];
        for (let key in DaPlayer.properties) {
            attributes.push(key.toLowerCase());
        }
        return attributes;
    }
    attributeChangedCallback(name, oldValue, newValue, namespace) {
        if (oldValue === newValue) {
            return;
        }
        this.props[name] = newValue;
        if (name === 'data-hand' && newValue) {
            this.shadowRoot.getElementById('hand-context').innerHTML = newValue;
        }
        if (name === 'data-hero' && newValue) {
            this.shadowRoot.getElementById('hero-context').innerHTML = newValue;
        }
    }
    requestRender() {
        const template = document.createElement('template');
        template.innerHTML = this.getTemplate({});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}
customElements.define(DaPlayer.is, DaPlayer);
