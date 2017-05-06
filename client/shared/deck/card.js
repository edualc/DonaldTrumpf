"use strict";

const CardColor = {
    HEARTS: "HEARTS",
    DIAMONDS: "DIAMONDS",
    CLUBS: "CLUBS",
    SPADES: "SPADES"
};

let Card = {
    equals: function(otherCard) {
        return this.number === otherCard.number && this.color === otherCard.color;
    },

    translate: function() {
        switch(this.number) {
            case 6: // 6
                return 6
                break;
            case 7: // 7
                return 7;
                break;
            case 8: // 8
                return 8;
                break;
            case 9: // 9
                return 9;
                break;
            case 10: // 10
                return 10;
                break;
            case 11: // bube
                return 'Bube';
                break;
            case 12: // dame
                return 'Dame';
                break;
            case 13: // könig
                return 'König';
                break;
            case 14: // ass
                return 'Ass';
                break;
            default:
        }
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