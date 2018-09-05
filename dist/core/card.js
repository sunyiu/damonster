export var DaCardType;
(function (DaCardType) {
    DaCardType["Monster"] = "m";
    DaCardType["Hero"] = "h";
    DaCardType["Skill"] = "s";
    DaCardType["Item"] = "i";
})(DaCardType || (DaCardType = {}));
export function GetCards() {
    return {
        monster: [
            new DaCard("m1", DaCardType.Monster),
            new DaCard("m2", DaCardType.Monster),
            new DaCard("m3", DaCardType.Monster),
            new DaCard("m4", DaCardType.Monster),
            new DaCard("m5", DaCardType.Monster),
            new DaCard("m6", DaCardType.Monster),
            new DaCard("m7", DaCardType.Monster)
        ],
        hero: [
            new DaCard("h1", DaCardType.Hero),
            new DaCard("h2", DaCardType.Hero),
            new DaCard("h3", DaCardType.Hero),
            new DaCard("h4", DaCardType.Hero),
            new DaCard("h5", DaCardType.Hero),
            new DaCard("h6", DaCardType.Hero),
            new DaCard("h7", DaCardType.Hero),
            new DaCard("h8", DaCardType.Hero),
            new DaCard("h9", DaCardType.Hero),
            new DaCard("h10", DaCardType.Hero)
        ]
    };
}
export class DaCard {
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
    }
    constructor(name, type) {
        this._name = name;
        this._type = type;
    }
    tostring() {
        return `CARD:: "${this._name}"`;
    }
}
export class DaHeroCard extends DaCard {
    constructor(name) {
        super(name, DaCardType.Hero);
    }
}
