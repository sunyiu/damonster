'use strict';
export default class DaHand extends HTMLElement {
    constructor() {
        super();
        this.props = {};
        this.attachShadow({ mode: 'open' });
        // Initialize declared properties
        for (let key in DaHand.properties) {
            this.props[key] = DaHand.properties[key].value;
        }
        this.requestRender();
    }
    static get is() { return 'da-hand'; }
    getTemplate(props) {
        return `
            <style>
			</style>
            <!-- shadow DOM for your element -->
			<div id="da-hand-container"></div>
        `;
    }
    static get properties() {
        return {
            'data-cards': {
                type: String,
                value: ''
            }
        };
    }
    static get observedAttributes() {
        const attributes = [];
        for (let key in DaHand.properties) {
            attributes.push(key.toLowerCase());
        }
        return attributes;
    }
    attributeChangedCallback(name, oldValue, newValue, namespace) {
        if (oldValue === newValue) {
            return;
        }
        this.props[name] = newValue;
        if (name === 'data-cards' && newValue) {
            this.shadowRoot.getElementById('da-hand-container').innerHTML = newValue;
        }
    }
    requestRender() {
        const template = document.createElement('template');
        template.innerHTML = this.getTemplate({});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}
customElements.define(DaHand.is, DaHand);
