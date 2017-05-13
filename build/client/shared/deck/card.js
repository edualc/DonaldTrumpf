"use strict";

var CardColor = {
    HEARTS: "HEARTS",
    DIAMONDS: "DIAMONDS",
    CLUBS: "CLUBS",
    SPADES: "SPADES"
};
var CardTranslations = ['', '', '', '', '', '', 6, 7, 8, 9, 10, 'Bube', 'Dame', 'König', 'Ass'];

var Card = {
    equals: function equals(otherCard) {
        return this.number === otherCard.number && this.color === otherCard.color;
    },
    // cle: "toHuman" Übersetzung der Karte
    translate: function translate() {
        return CardTranslations[this.number] + "\t" + this.color;
    },
    // cle: Sortieren der Karten nach :prop
    sortByProperty: function sortByProperty(prop) {
        return function (a, b) {
            if (typeof a[prop] === 'number') {
                return a[prop] - b[prop];
            } else if (a[prop] < b[prop]) {
                return -1;
            } else if (a[prop] > b[prop]) {
                return 1;
            } else {
                return 0;
            }
        };
    },
    sortByColorAndNumber: function sortByColorAndNumber() {
        var self = this;
        return function (a, b) {
            if (a['color'] < b['color']) {
                return -1;
            } else if (a['color'] > b['color']) {
                return 1;
            } else {
                return b['number'] - a['number'];
            }
        };
    }
};

var create = function create(number, color) {
    var card = Object.create(Card);
    card.number = number;
    card.color = color;
    return card;
};

module.exports = {
    CardColor: CardColor,
    create: create
};