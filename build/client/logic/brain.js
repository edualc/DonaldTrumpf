'use strict';
/*
 The Brain is the core decision source when reacting to server requests that need to implement decent choosing logic (card, trumpf or schiäbä).
 This implementation basically responds with either default behaviour or random valid cards.
 */

var Validation = require('../shared/validation/validation');
var Card = require('./../shared/deck/card');

var GameTypes = [{ label: 'trumpfHearts', color: 'HEARTS', mode: 'TRUMPF' }, { label: 'trumpfDiamonds', color: 'DIAMONDS', mode: 'TRUMPF' }, { label: 'trumpfClubs', color: 'CLUBS', mode: 'TRUMPF' }, { label: 'trumpfSpades', color: 'SPADES', mode: 'TRUMPF' }, { label: 'obeabe', color: 'HEARTS', mode: 'OBEABE' }, { label: 'undeufe', color: 'HEARTS', mode: 'UNDEUFE' }];

// TODO: Evaluierungsstatistik mitführen
var CurrentDeckWeights = {};
var CurrentColorWeights = { color: '', count: 0, trumpfWeight: 0 };

// Effektive Kartenwerte beim Auszählen am Ende
var TrumpfValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 10, 20, 3, 4, 11]; // Kartenwert für Trumpf
var NotTrumpfValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 2, 3, 4, 11]; // Kartenwert für Nicht-Trumpf
var ObeabeValues = [0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 10, 2, 3, 4, 11]; // Kartenwert bei Obeabe
var UndeufeValues = [0, 0, 0, 0, 0, 0, 11, 0, 8, 0, 10, 2, 3, 4, 0]; // Kartenwert bei Undeufe

// Gewichtete Kartenwerte beim Auszählen am Ende (zurzeit "willkürlich" gewichtet)
var TrumpfWeights = [0, 0, 0, 0, 0, 0, 1, 1, 1, 8, 2, 13, 2, 4, 6]; // Kartenwert für Trumpf
var NotTrumpfWeights = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 4, 6, 9, 13]; // Kartenwert für Nicht-Trumpf
var ObeabeWeights = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 3, 4, 9, 16]; // Kartenwert bei Obeabe
var UndeufeWeights = [0, 0, 0, 0, 0, 0, 16, 9, 4, 3, 2, 1, 1, 1, 1]; // Kartenwert bei Undeufe

var Brain = {
    geschoben: false,
    // Retourniert (boolean), ob die :card im :gameType ein Trumpf ist.
    _isTrumpf: function _isTrumpf(card, gameType) {
        return gameType.mode === 'TRUMPF' ? card.color === gameType.color : false;
    },
    // Retoruniert den Wert der :card im :gameType bei der Auszählung am Ende
    _mapCardToValue: function _mapCardToValue(card, gameType) {
        switch (gameType.mode) {
            case 'TRUMPF':
                return this._isTrumpf(card, gameType) ? TrumpfValues[card.number] : NotTrumpfValues[card.number];
                break;
            case 'OBEABE':
                return ObeabeWeights[card.number];
                break;
            case 'UNDEUFE':
                return UndeufeValues[card.number];
        }
    },
    // Retourniert einen gewichteten Wert für die Kartenevaluierung beim Trumpfbestimmen
    _mapCardToWeight: function _mapCardToWeight(card, gameType) {
        switch (gameType.mode) {
            case 'TRUMPF':
                return card.color == gameType.color ? TrumpfWeights[card.number] : NotTrumpfWeights[card.number];
                break;
            case 'OBEABE':
                return ObeabeWeights[card.number];
                break;
            case 'UNDEUFE':
                return UndeufeWeights[card.number];
        }
    },
    // skeleton method: returns the gameType to be played
    chooseTrumpf: function chooseTrumpf(handcards) {
        //CHALLENGE2017: Implement logic to chose game mode which is best suited to your handcards or schiäbä. Consider that this decision ist quite crucial for your bot to be competitive

        // Evaluate different options for own cards
        // 1. Which is best for my cards
        var gameTypes = Object.create(GameTypes);
        var topGameType;
        var topGameTypeWeight = 0;

        this._printHandcards(handcards);

        // TODO: zusätzlich 'Wiis' Wert mit 20% (?) zusätzlich Skalieren
        // TODO: Trumpf Card Count
        for (var i = gameTypes.length - 1; i >= 0; i--) {
            var generalWeight = 0;
            var gameTypeWeight = 0;
            for (var j = handcards.length - 1; j >= 0; j--) {
                generalWeight += this._mapCardToWeight(handcards[j], gameTypes[i]);

                if (handcards[j].color === gameTypes[i].color) {
                    gameTypeWeight += this._mapCardToWeight(handcards[j], gameTypes[i]);
                }
            }

            // Vergleiche die verschiedenen gameTypes und nimm den jeweils höchsten Wert
            if (generalWeight + gameTypeWeight > topGameTypeWeight) {
                topGameType = gameTypes[i];
                topGameTypeWeight = generalWeight + gameTypeWeight;
            }

            console.log(gameTypes[i].label + ' --- Kartengewicht: ' + generalWeight + ' --- Spieltypgewicht: ' + gameTypeWeight + ' --- Summe: ' + (generalWeight + gameTypeWeight));
        }
        console.log("-----\r\nTOPGAMETYPE: " + topGameType.color + ' - ' + topGameType.mode + "\r\n-----");

        // 2. Which is best for my non-trumpf/obeabe/undeufe cards

        // 3. Which is statistically best for my other bot instance

        // Set gameType according to evaluation above
        var gameType = { "mode": topGameType.mode, "trumpfColor": topGameType.color };
        return gameType;
    },
    gameMode: function gameMode(gameType) {
        this.geschoben = gameType.mode === "SCHIEBE"; //just remember if it's a geschoben match
        this.gameType = gameType;
    },
    // skeleton method: returns the card to be played
    chooseCard: function chooseCard(handcards, tableCards) {
        //CHALLENGE2017: Implement logic to choose card so your bot will beat all the others. Keep in mind that your counterpart is another instance of your bot

        // 1. What are my possible cards to play (legal moves)
        var validCards = this.getPossibleCards(handcards, tableCards);

        // 1.1 If only one card is left to play, play this card.
        if (validCards.length === 1) {
            return validCards[0];
        }

        // 1.2 What is the current tableState? Are we playing the first card or
        // do we respond to some other cards on the table?
        if (tableCards.length === 0) {
            console.log('Wir spielen die erste Karte! ' + this._defaultLogAttributes());
        } else {
            // Angespielte Farbe
            var leadColor = tableCards[0].color;
            console.log(leadColor + ' wurde angespielt. ' + this._defaultLogAttributes());
        }

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
    // skeleton method: returns valid cards to be played
    getPossibleCards: function getPossibleCards(handCards, tableCards) {
        var validation = Validation.create(this.gameType.mode, this.gameType.trumpfColor);
        var possibleCards = handCards.filter(function (card) {
            if (validation.validate(tableCards, handCards, card)) {
                return true;
            }
        }, this);
        return possibleCards;
    },
    // skeleton method
    setValidation: function setValidation(gameMode, trumpfColor) {
        this.validation = Validation.create(gameMode, trumpfColor);
    },
    // Ausgeben der Handkarten im Log (sortiert nach Farbe)
    _printHandcards: function _printHandcards(handcards) {
        console.log('-----');
        console.log('HANDKARTEN:');
        handcards = handcards.sort(handcards[0].sortByProperty('color'));
        for (var i = handcards.length - 1; i >= 0; i--) {
            console.log(handcards[i].translate());
        }
        console.log('-----');
    },

    // Zustand des aktuellen Spiels
    _defaultLogAttributes: function _defaultLogAttributes() {
        return [this.gameType.mode, this.gameType.color, this.geschoben].join(' / ');
    }
};

var create = function create() {
    var brain = Object.create(Brain);
    return brain;
};

module.exports = {
    create: create
};