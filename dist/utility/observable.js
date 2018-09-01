export default class Observable {
    static getHanlder(map) {
        return {
            apply: function (target, thisArg, argumentsList) {
                console.log(map);
                return thisArg[target].apply(this, argumentList);
            },
            set: function (target, property, value, receiver) {
                console.log(map);
                target[property] = value;
                console.log("Set %s to %o", property, value);
                return true;
            }
        };
    }
    static createViewModel(obj, observeProperties, handler) {
        let viewModel = {};
        observeProperties.forEach((p, index) => {
            var descriptor = Object.getOwnPropertyDescriptor(obj, p);
            if (!descriptor) {
                throw new Error("Property ${p} does not exist in Object ${obj}");
            }
            if (typeof descriptor.value == 'object') {
                //TODO:: writable is false by default, 
                //therefore cannot assign another object
                //will it be OK?????
                //If writable is set to true, the obserable will be lose
                //How to deal with it?????                               
                Object.defineProperty(viewModel, p, { value: new Proxy(descriptor.value, handler) });
            }
            else {
                Object.defineProperty(viewModel, p, {
                    value: descriptor.value,
                    writable: true
                });
            }
        });
        return viewModel;
    }
    static make(obj, observeProperties) {
        let map = [], handler = Observable.getHanlder(map), viewModel = Observable.createViewModel(obj, observeProperties, handler), proxy = new Proxy(viewModel, handler);
        //inject local private proxy property and hook up with the public variable...
        Object.defineProperty(obj, "__observer", {
            value: {
                "proxy": proxy,
                "eventMap": map,
                "handler": handler
            }
        });
        observeProperties.forEach((p, index) => {
            obj.__defineSetter__(p, (value) => {
                proxy[p] = value;
            });
            obj.__defineGetter__(p, () => {
                return proxy[p];
            });
        });
    }
    static addListener(obj, property, callback) {
        if (!Object.getOwnPropertyNames(obj).includes('__observer')) {
            throw new Error("Object ${obj} is not an observable object!!!");
            return;
        }
    }
}
