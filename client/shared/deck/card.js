"use strict";

const CardColor = {
    HEARTS: "HEARTS",
    DIAMONDS: "DIAMONDS",
    CLUBS: "CLUBS",
    SPADES: "SPADES"
};
let CardTranslations = ['','','','','','',6,7,8,9,10,'Bube','Dame','König','Ass'];

let Card = {
    equals: function(otherCard) {
        return this.number === otherCard.number && this.color === otherCard.color;
    },
    // cle: "toHuman" Übersetzung der Karte
    translate: function() {
        return CardTranslations[this.number] + "\t" + this.color;
    },
    // cle: Sortieren der Karten nach :prop
    sortByProperty: function(prop) {
      return function(a, b) {
        if (typeof a[prop] === 'number') {
          return (a[prop] - b[prop]);
        } else if (a[prop] < b[prop]) {
          return -1;
        } else if (a[prop] > b[prop]) {
          return 1;
        } else {
            return 0;
        }
      };
    }
};

let create = function create(number, color) {
    let card = Object.create(Card);
    card.number = number;
    card.color = color;
    return card;
};

module.exports = {
    CardColor: CardColor,
    create
};