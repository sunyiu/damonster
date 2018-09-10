export default class Observable {

        private static getHandler(obj:Object) {
                return {
                        '__observableObj': obj,

                        apply: function (target, thisArg, argumentsList) {
                                //console.log("Apply %o %o %o", target, thisArg, argumentsList);
                                return thisArg[target].apply(this, argumentList);
                        },
                        set: function (target, property, value, receiver) {
                                
                                target[property] = value;
                                                                                                                     
                                if (isNaN(property)){
                                        //skip the callback becase it is an array index
                                        //and set will be called twice (index and length)
                                        //skipping the index one but keeping the length                                                                                
                                        if (Array.isArray(target)){
                                                let p = receiver['__observableArrayName'];
                                                //console.log('swap property %s --> %o', property, p);
                                                property = p;
                                        }                                
        
                                        let map = this['__observableObj']['__observable']['eventMap'],
                                            callbacks = map[property];
        
                                        if (callbacks){
                                                callbacks.forEach((c) =>{
                                                        c.call(null, value);
                                                });
                                        }                                                                                                                                                                                                                                      
                                }
                                                                                                 
                                //console.log("Set %s to %o", property, value);
                                return true;
                        }
                };
        }
                
        static addListener(obj: Object, property:string, callback){
                
                if (!Object.getOwnPropertyNames(obj).includes(property)) {
                        throw new Error("Property ${property} not exists in Object ${obj}");
                        return;
                }
                
                let proxy = null, eventMap = null, handler = null;
                if (!Object.getOwnPropertyNames(obj).includes('__observable')) {
                        eventMap = {};                        
                        proxy = new Proxy({}, Observable.getHandler(obj, eventMap));                                                
                        Object.defineProperty(obj, "__observable", { value: {
                                proxy:  proxy,
                                eventMap: eventMap,
                                handler: Observable.getHandler(obj)
                        }, writable: false });
                        handler = Observable.getHandler(obj);                        
                }else{                        
                        eventMap = obj['__observable']['eventMap'];                        
                        proxy = obj['__observable']['proxy'];     
                        handler = obj['__observable']['handler']                                           
                }
                
                //add to proxy if not exist
                if (!Object.getOwnPropertyNames(proxy).includes(property)){
                        let value = Array.isArray(obj[property]) ? Observable.createArrayProxy(property, obj[property], handler) : obj[property];                        
                        
                        Object.defineProperty(proxy, property, {value: value, writable: true});
                        
                        obj.__defineSetter__(property, (value) => {
                                proxy[property] = (Array.isArray(value)) 
                                        ? Observable.createArrayProxy(property, value, handler)
                                        : value;
                        });
                        obj.__defineGetter__(property, () => {
                                return proxy[property];
                        });                                                                                                                
                }
                
                //add callback to eventMap
                if (Object.getOwnPropertyNames(eventMap).includes(property)){
                        eventMap[property].push(callback);
                }else{
                        Object.defineProperty(eventMap, property, {value: [callback]});
                }                                                                                                         
        }         
        
        static createArrayProxy(name, value, handler){
                if (!Array.isArray(value)){
                        throw new Error('Value is not an array, cannot create array proxy');
                }
                
                let proxy = new Proxy(value, handler);
                Object.defineProperty(proxy, '__observableArrayName', {value: name});
                return proxy;                 
        }              
}
