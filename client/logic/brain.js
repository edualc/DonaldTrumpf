'use strict';

/*
 The Brain is the core decision source when reacting to server requests that need to implement decent choosing logic (card, trumpf or schiäbä).
 This implementation basically responds with either default behaviour or random valid cards.
 */

let Validation = require('../shared/validation/validation');
let Card = require('./../shared/deck/card');

// 6
// 7
// 8
// 9
// 10
// 11 bube
// 12 dame
// 13 könig
// 14 ass

// Handcards:
// [ { number: 6, color: 'DIAMONDS' },
//   { number: 6, color: 'HEARTS' },
//   { number: 11, color: 'DIAMONDS' },
//   { number: 11, color: 'SPADES' },
//   { number: 8, color: 'HEARTS' },
//   { number: 6, color: 'SPADES' },
//   { number: 10, color: 'HEARTS' },
//   { number: 9, color: 'DIAMONDS' },
//   { number: 7, color: 'HEARTS' } ]

let GameTypes = [
    { name: 'trumpfHearts', color: 'HEARTS', mode: 'TRUMPF' },
    { name: 'trumpfDiamonds', color: 'DIAMONDS', mode: 'TRUMPF' },
    { name: 'trumpfClubs', color: 'CLUBS', mode: 'TRUMPF' },
    { name: 'trumpfSpades', color: 'SPADES', mode: 'TRUMPF' },
    { name: 'obeabe', color: 'HEARTS', mode: 'OBEABE' },
    { name: 'undeufe', color: 'HEARTS', mode: 'UNDEUFE' }  
];

let Brain = {
    geschoben: false,
    _mapCardToValue: function(card, gameType) {
        switch(card.number) {
            case 6: // 6
                return (gameType.mode === 'UNDEUFE') ? 11 : 0;
                break;
            case 7: // 7
                return 0;
                break;
            case 8: // 8
                return ((gameType.mode === 'OBEABE') || (gameType.mode === 'UNDEUFE')) ? 8 : 0;
                break;
            case 9: // 9
                return ((card.color === gameType.color) && (gameType.mode === 'TRUMPF')) ? 14 : 0;
                break;
            case 10: // 10
                // TODO: Skalieren, da viel Wert, aber nicht wirklich starke Karte?
                return 10;
                break;
            case 11: // bube
                return ((card.color === gameType.color) && (gameType.mode === 'TRUMPF')) ? 20 : 2;
                break;
            case 12: // dame
                return 3;
                break;
            case 13: // könig
                return 4;
                break;
            case 14: // ass
                return (gameType.mode === 'UNDEUFE') ? 0 : 11;
                break;
            default:
        }
    },
    chooseTrumpf: function (handcards) {
        //CHALLENGE2017: Implement logic to chose game mode which is best suited to your handcards or schiäbä. Consider that this decision ist quite crucial for your bot to be competitive
        
        let gameTypes = Object.create(GameTypes);
        var topGameType;
        var topGameTypeWeight = 0;

        console.log('-----');
        console.log('HANDKARTEN:');
        // console.log(handcards);

        for (var i = handcards.length - 1; i >= 0; i--) {
            console.log(handcards[i].translate() + "\t\t" + handcards[i].color);
        }

        console.log('-----');

        // TODO: zusätzlich 'Wiis' Wert mit 20% (?) zusätzlich Skalieren
        for (var i = gameTypes.length - 1; i >= 0; i--) {
            var generalWeight = 0;
            var gameTypeWeight = 0;
            for (var j = handcards.length - 1; j >= 0; j--) {
                generalWeight += this._mapCardToValue(handcards[j], gameTypes[i]);
                // TODO: Spieltypgewicht für OBEABE zu hoch, UNDEUFE zu tief?
                // if ((gameTypes[i].mode === 'UNDEUFE') || (gameTypes[i].mode === 'OBEABE') || (handcards[j].color === gameTypes[i].color)) {
                //     gameTypeWeight += this._mapCardToValue(handcards[j], gameTypes[i]);
                // }
                // 
                // TODO: Trumpf Card Count
                // TODO: Gewichtung bei OBEABE / UNDEUFE nicht anhand vom Wert der Karte

                if (handcards[j].color === gameTypes[i].color) {
                    gameTypeWeight += this._mapCardToValue(handcards[j], gameTypes[i]);
                }
            }

            if (((generalWeight + gameTypeWeight) > topGameTypeWeight) && (gameTypes[i].mode === 'TRUMPF')) {
                topGameType = gameTypes[i];
                topGameTypeWeight = (generalWeight + gameTypeWeight);
            }

            console.log(gameTypes[i].name + ' --- Kartengewicht: ' + generalWeight + ' --- Spieltypgewicht: ' + gameTypeWeight + ' --- Summe: ' + (generalWeight + gameTypeWeight));
        }

        console.log('-----');
        console.log('TOPGAMETYPE: ' + topGameType.color + ' - ' + topGameType.mode);
        console.log('-----');

        // Evaluate different options for own cards
        // ("TRUMPF"(HEARTS","DIAMONDS","CLUBS","SPADES"),"OBEABE","UNDEUFE","SCHIEBE")
        // 1. Which is best for my cards
        

        // 2. Which is best for my non-trumpf/obeabe/undeufe cards
        

        // 3. Which is statistically best for my other bot instance


        let gameType = { "mode": topGameType.mode, "trumpfColor": topGameType.color };
        return gameType;
    },
    gameMode: function (gameType) {
        this.geschoben = gameType.mode === "SCHIEBE"; //just remember if it's a geschoben match
        this.gameType = gameType;
    },
    chooseCard: function (handcards, tableCards) {
        //CHALLENGE2017: Implement logic to choose card so your bot will beat all the others. Keep in mind that your counterpart is another instance of your bot

        // 1. What are my possible cards to play (legal moves)
        let validCards = this.getPossibleCards(handcards, tableCards);

        // 2. Is the Stich already ours?
        

        // 2.1 Is it save to assume it can't be taken (chance?)
        

        // 2.2 Can I save it? / Even if I save it?
        

        // 3. Which card is the least valuable one that achieves my goal?
        

        // 4. If the Stich is ours, can I add a 10 to get the points?
        

        // 5. Should I use a TRUMPF? (stich.value > x?)
        

        // 6. If I can't play the correct color and don't want to use a TRUMPF, what color can i 
        // give to tell my other bot instance which color I'd like him to play?



        return validCards[0]; // Just take the first valid card
    },
    getPossibleCards: function (handCards, tableCards) {
        let validation = Validation.create(this.gameType.mode, this.gameType.trumpfColor);
        let possibleCards = handCards.filter(function (card) {
            if (validation.validate(tableCards, handCards, card)) {
                return true;
            }
        }, this);
        return possibleCards;
    },
    setValidation: function (gameMode, trumpfColor) {
        this.validation = Validation.create(gameMode, trumpfColor);
    }
};

let create = function () {
    let brain = Object.create(Brain);
    return brain;
};

module.exports = {
    create
};