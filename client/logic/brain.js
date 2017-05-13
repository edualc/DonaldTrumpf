'use strict';
/*
 The Brain is the core decision source when reacting to server requests that need to implement decent choosing logic (card, trumpf or schiäbä).
 This implementation basically responds with either default behaviour or random valid cards.
 */

let Validation = require('../shared/validation/validation');
let Card = require('./../shared/deck/card');
import { StrategyFactory } from './strategy/StrategyFactory';

let strategies = new StrategyFactory().getStrategies();

let GameTypes = [
    { label: 'trumpfHearts', trumpfColor: 'HEARTS', mode: 'TRUMPF' },
    { label: 'trumpfDiamonds', trumpfColor: 'DIAMONDS', mode: 'TRUMPF' },
    { label: 'trumpfClubs', trumpfColor: 'CLUBS', mode: 'TRUMPF' },
    { label: 'trumpfSpades', trumpfColor: 'SPADES', mode: 'TRUMPF' },
    { label: 'obeabe', mode: 'OBEABE' },
    { label: 'undeufe', mode: 'UNDEUFE' }  
];

// TODO: Evaluierungsstatistik mitführen
let CurrentColorWeights = { color: '', count: 0, trumpfWeight: 0, nonTrumpfWeight: 0 };

// Effektive Kartenwerte beim Auszählen am Ende
let TrumpfValues =    [0,0,0,0,0,0, 0, 0, 0,14,10,20, 3, 4,11]; // Kartenwert für Trumpf
let NotTrumpfValues = [0,0,0,0,0,0, 0, 0, 0, 0,10, 2, 3, 4,11]; // Kartenwert für Nicht-Trumpf
let ObeabeValues =    [0,0,0,0,0,0, 0, 0, 8, 0,10, 2, 3, 4,11]; // Kartenwert bei Obeabe
let UndeufeValues =   [0,0,0,0,0,0,11, 0, 8, 0,10, 2, 3, 4, 0]; // Kartenwert bei Undeufe

// Gewichtete Kartenwerte (zurzeit "willkürlich" gewichtet)
// let TrumpfWeights =    [0,0,0,0,0,0, 1, 1, 1, 9, 1,11, 3, 4, 7]; // Kartenwert für Trumpf
// let NotTrumpfWeights = [0,0,0,0,0,0, 1, 1, 1, 1, 3, 4, 7, 9,11]; // Kartenwert für Nicht-Trumpf
// let ObeabeWeights =    [0,0,0,0,0,0, 1, 1, 1, 1, 3, 4, 7, 9,11]; // Kartenwert bei Obeabe
// let UndeufeWeights =   [0,0,0,0,0,0,11, 9, 7, 4, 3, 1, 1, 1, 1]; // Kartenwert bei Undeufe
let TrumpfWeights =    [0,0,0,0,0,0, 1, 2, 3, 8, 4, 9, 5, 6, 7]; // Kartenwert für Trumpf
let NotTrumpfWeights = [0,0,0,0,0,0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Kartenwert für Nicht-Trumpf
let ObeabeWeights =    [0,0,0,0,0,0, 1, 1, 1, 2, 2, 5, 7, 8, 11]; // Kartenwert bei Obeabe
let UndeufeWeights =   [0,0,0,0,0,0, 11, 8, 6, 5, 2, 2, 1, 1, 1]; // Kartenwert bei Undeufe

// Höherer Wert gewinnt gegen tieferen Wert
let TrumpfPriority =    [0,0,0,0,0,0,11,12,13,18,14,19,15,16,17]; // Trumpf gewinnt immer gegen Nichttrumpf (+10)
let NotTrumpfPriority = [0,0,0,0,0,0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
let ObeabePriority =    [0,0,0,0,0,0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
let UndeufePriority =   [0,0,0,0,0,0, 9, 8, 7, 6, 5, 4, 3, 2, 1];

let Brain = {
    geschoben: false,
    hadTrumpfInLastStich: true, // shows if the opposing team had given trumpf in the last stich (is used for re-trumpf'ing)
    playedCards: [], // already played cards in the current game
    stichCards: [], // cards that are in the current stich
    trumpfCount: 0,
    stichCount: 0,
    // skeleton method: returns the gameType to be played
    chooseTrumpf: function (handcards) {
        //CHALLENGE2017: Implement logic to chose game mode which is best suited to your handcards or schiäbä. Consider that this decision ist quite crucial for your bot to be competitive
        
        // Evaluate different options for own cards
        // 1. Which is best for my cards
        let gameTypes = Object.create(GameTypes);
        var topGameType;
        var topGameTypeWeight = 0;

        this._printHandcards(handcards);

        let cardColors = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"];
        let evaluationArray = [];

        let currentColorTrumpfWeight;
        let currentColorNonTrumpfWeight;
        let currentTrumpfCount;
        let currentGameType;

        // TRUMPF evalaution
        for (var i = cardColors.length - 1; i >= 0; i--) {
            currentColorTrumpfWeight = 0;
            currentColorNonTrumpfWeight = 0;
            currentGameType = { mode: 'TRUMPF', trumpfColor: cardColors[i] };

            for (var j = handcards.length - 1; j >= 0; j--) {
                if (this._isTrumpf(handcards[j], currentGameType)) {
                    currentColorTrumpfWeight += this._mapCardToWeight(handcards[j], currentGameType);
                } else {
                    currentColorNonTrumpfWeight += this._mapCardToWeight(handcards[j], currentGameType);
                }
            }

            // summary for the current color evaluation
            evaluationArray.push({ weight: (((currentColorTrumpfWeight) * 1.2 + (currentColorNonTrumpfWeight / 3) * 0.8) * 2), color: cardColors[i], mode: 'TRUMPF' });
        }

        // OBEABE evaluation
        currentGameType = { mode: 'OBEABE' };
        let obeabeWeight = 0;

        for (var i = handcards.length - 1; i >= 0; i--) {
            obeabeWeight += this._mapCardToWeight(handcards[i], currentGameType);
        }
        evaluationArray.push({ weight: obeabeWeight, mode: 'OBEABE', color: 'HEARTS' });


        // UNDEUFE evaluation
        currentGameType = { mode: 'UNDEUFE' };
        let undeufeWeight = 0;

        for (var i = handcards.length - 1; i >= 0; i--) {
            undeufeWeight += this._mapCardToWeight(handcards[i], currentGameType);
        }
        evaluationArray.push({ weight: undeufeWeight, mode: 'UNDEUFE', color: 'HEARTS' });


        // ITERATE TO FIND MAX
        console.log('---###---');
        let bestMode = evaluationArray[0];
        for (var i = evaluationArray.length - 1; i >= 0; i--) {
            console.log("weight:\t" + parseFloat(evaluationArray[i].weight).toFixed(2) + "\tmode:\t" + evaluationArray[i].mode + "\tcolor:\t" + evaluationArray[i].color)
            if (evaluationArray[i].weight >= bestMode.weight) {
                bestMode = evaluationArray[i];
            }
        }
        console.log('---###---');


        /**
         * OLD
         */
        // // TODO: zusätzlich 'Wiis' Wert mit 20% (?) zusätzlich Skalieren
        // // TODO: Count How Many Trumpf do I have if this color would be Trumpf?
        // for (var i = gameTypes.length - 1; i >= 0; i--) {
        //     var generalWeight = 0;
        //     var gameTypeWeight = 0;
        //     for (var j = handcards.length - 1; j >= 0; j--) {
        //         generalWeight += this._mapCardToWeight(handcards[j], gameTypes[i]);

        //         if (handcards[j].color === gameTypes[i].trumpfColor) {
        //             gameTypeWeight += this._mapCardToWeight(handcards[j], gameTypes[i]);
        //         }
        //     }

        //     // Vergleiche die verschiedenen gameTypes und nimm den jeweils höchsten Wert
        //     if ((generalWeight + gameTypeWeight) > topGameTypeWeight) {
        //         topGameType = gameTypes[i];
        //         topGameTypeWeight = (generalWeight + gameTypeWeight);
        //     }

        //     console.log(gameTypes[i].label + ' --- Kartengewicht: ' + generalWeight + ' --- Spieltypgewicht: ' + gameTypeWeight + ' --- Summe: ' + (generalWeight + gameTypeWeight));
        // }
        // console.log("-----\r\nTOPGAMETYPE: " + topGameType.trumpfColor + ' - ' + topGameType.mode + "\r\n-----");
        /**
         * OLD
         */


        // 2. Which is best for my non-trumpf/obeabe/undeufe cards
        
        // 3. Which is statistically best for my other bot instance

        // Set gameType according to evaluation above
        let gameType = { "mode": bestMode.mode, "trumpfColor": bestMode.color };
        return gameType;
    },
    gameMode: function (gameType) {
        this.geschoben = gameType.mode === "SCHIEBE"; //just remember if it's a geschoben match
        this.gameType = gameType;
    },
    // skeleton method: returns the card to be played
    chooseCard: function (handcards, tableCards) {
        //CHALLENGE2017: Implement logic to choose card so your bot will beat all the others. Keep in mind that your counterpart is another instance of your bot

        // get all the legal cards to play at this time
        var validCards = this.getPossibleCards(handcards, tableCards);
        var stichIsOurs = false;

        // We are the first to play this stich
        if (tableCards.length === 0) {
            console.log("-----\r\n#####" + ' Wir spielen die erste Karte! ' + this._defaultLogAttributes() + "\r\n-----");

        // A color has been played, we have to react to already played Cards
        } else {
            // Angespielte Farbe
            let leadColor = tableCards[0].color;
            console.log("-----\r\n#####" + leadColor + ' wurde angespielt. ' + this._defaultLogAttributes() + "\r\n-----");
        
            stichIsOurs = this._checkCurrentStichForOwnership(leadColor);
        }

        console.log("-----\r\n###### Ist der Stich uns? " + stichIsOurs + "\r\n-----");


        // differentiate between the different gamemodes
        switch (this.gameType.mode) {
            case 'TRUMPF':
                let trumpfBuur = Card.create(11, this._curTrumpfColor());
                let trumpfNell = Card.create(9, this._curTrumpfColor());
                let trumpfAss = Card.create(14, this._curTrumpfColor());

                // First stich: Who has Trumpf?
                // (If first stich and this instance just chose Trumpf)
                if ((this.stichCount === 0) && (this.stichCards.length === 0)) {
                    // If you have both Nell + Ass, play Ass
                    if ((validCards.indexOf(trumpfNell) >= 0) && (validCards.indexOf(trumpfAss) >= 0)) {
                        return trumpfAss;
                    }
                    // If you have both Buur + Ass, play Ass
                    if ((validCards.indexOf(trumpfAss) >= 0) && (validCards.indexOf(trumpfBuur) >= 0)) {
                        return trumpfAss;
                    }
                    // If you have both Buur + Nell, play Nell
                    if ((validCards.indexOf(trumpfNell) >= 0) && (validCards.indexOf(trumpfBuur) >= 0)) {
                        return trumpfNell;
                    }

                    // What Trumpf Cards do I have?
                    let self = this;
                    let currentTrumpfCards = [];
                    currentTrumpfCards = validCards.filter(
                        function(c) {
                            return self._isTrumpf(c, self.gameType);
                        }, this
                    );

                    let highestTrumpf = currentTrumpfCards[0];

                    for (var i = currentTrumpfCards.length - 1; i >= 0; i--) {
                        if (self._cardPriority(currentTrumpfCards[i], currentTrumpfCards[i].color, self.gameType) > self._cardPriority(highestTrumpf, highestTrumpf.color, self.gameType)) {
                            highestTrumpf = currentTrumpfCards[i];
                        }
                    }

                    // Play highest Trumpf in the beginning to draw them out.
                    return highestTrumpf;
                // Any Stich where this instance didn't make trumpf or it isn't the first stich
                } else {
                    // I am first to play this stich
                    if (this.stichCards.length === 0) {
                        let highestCard = validCards[0];
                        let lowestCard = validCards[0];

                        // TODO: Hier kann potentiell untertrumpft werden!
                        let self = this;
                        for (var i = validCards.length - 1; i >= 0; i--) {
                            if (self._cardPriority(validCards[i], validCards[i].color, self.gameType) > self._cardPriority(highestCard, highestCard.color, self.gameType)) {
                                highestCard = validCards[i];
                            }
                            if (self._cardPriority(validCards[i], validCards[i].color, self.gameType) < self._cardPriority(lowestCard, lowestCard.color, self.gameType)) {
                                lowestCard = validCards[i];
                            }
                        }

                        // Falls der Stich bereits uns gehört, spiele die schlechteste Karte
                        // TODO: Testen, ist das sinnvoll?
                        return stichIsOurs ? lowestCard : highestCard;

                    // Someone already played before me
                    } else {
                        // Angespielte Farbe
                        let leadColor = tableCards[0].color;

                        let highestCard = validCards[0];
                        let lowestCard = validCards[0];

                        // TODO: Hier kann potentiell untertrumpft werden!
                        let self = this;
                        for (var i = validCards.length - 1; i >= 0; i--) {
                            if (self._cardPriority(validCards[i], leadColor, self.gameType) > self._cardPriority(highestCard, leadColor, self.gameType)) {
                                highestCard = validCards[i];
                            }
                            if (self._cardPriority(validCards[i], validCards[i].color, self.gameType) < self._cardPriority(lowestCard, lowestCard.color, self.gameType)) {
                                lowestCard = validCards[i];
                            }
                        }

                        // Falls der Stich bereits uns gehört, spiele die schlechteste Karte
                        // TODO: Testen, ist das sinnvoll?
                        return stichIsOurs ? lowestCard : highestCard;
                    }
                }

            break;
            case 'OBEABE':
            case 'UNDEUFE':
                // For now, just play the highest card possible
                let highestCard = validCards[0];
                // compare all the valid cards for their priority and pick one the highest card
                for (var i = validCards.length - 1; i >= 0; i--) {
                    if (this._cardPriority(validCards[i], validCards[i].color, this.gameType) > this._cardPriority(highestCard, highestCard.color, this.gameType)) {
                        highestCard = validCards[i];
                    }
                }
                return highestCard;
        }

        // 1. What are my possible cards to play (legal moves)

        // 1.1 What is the current tableState? Are we playing the first card or
        // do we respond to some other cards on the table?

        // 1.2 If only one card is left to play, play this card.

        // 2. Is the Stich already ours?

        // 2.1 Is it save to assume it can't be taken (chance?)

        // 2.2 Can I save it? / Even if I save it?

        // 3. Which card is the least valuable one that achieves my goal?

        // 4. If the Stich is ours, can I add a 10 to get the points?

        // 5. Should I use a TRUMPF? (stich.value > x?)

        // 6. If I can't play the correct color and don't want to use a TRUMPF, what color can i 
        // give to tell my other bot instance which color I'd like him to play?
        
        return validCards[0]; // Just take the first valid card (you should not get here)

    },
    // skeleton method: returns valid cards to be played
    getPossibleCards: function (handCards, tableCards) {
        let validation = Validation.create(this.gameType.mode, this.gameType.trumpfColor);
        let possibleCards = handCards.filter(function (card) {
            if (validation.validate(tableCards, handCards, card)) {
                return true;
            }
        }, this);
        return possibleCards;
    },
    // this method reset the statistics and counters as a new game is just being started
    resetPlayedCards: function() {
        this.playedCards = [];
        this.trumpfCount = 0;
        this.hadTrumpfInLastStich = true;
        this.stichCount = 0;
    },
    // this method handles statistics and counters for cards played in this game
    // and add :lastPlayedCard to the already played cards
    registerCardWasPlayed: function(lastPlayedCard, playedCards) {
        this.stichCards = playedCards;

        this.playedCards.push(lastPlayedCard);
        if (this._isTrumpf(lastPlayedCard, this.gameType)) {
            this.trumpfCount += 1;
        }
    },
    // this method keeps track of the current stich.
    registerStichCompleted: function() {
        this.stichCount += 1;
        this.stichCards = [];
    },
    // skeleton method
    setValidation: function (gameMode, trumpfColor) {
        this.validation = Validation.create(gameMode, trumpfColor);
    },
    // Retourniert die Stärke einer Karte bzgl. einer angespielten Farbe :leadColor
    // Zum Beispiel hat leadColor-Ass einen Wert von 9, eine Trumpf-6 hat aber eine 11
    // und gewinnt gegenüber dem nicht-Trumpf Ass
    _cardPriority: function(card, leadColor, gameType) {
        switch(gameType.mode) {
            case 'TRUMPF':
                // Weder Trumpf noch von der angegebenen Farbe
                if (!this._isTrumpf(card, gameType) && !this._isLeadColor(card, leadColor)) {
                    return 0;
                // Trumpf oder von der angegebenen Farbe
                } else {
                    return this._isTrumpf(card, gameType) ? TrumpfPriority[card.number] : NotTrumpfPriority[card.number]; 
                }
            break;
            case 'OBEABE':
                return (this._isLeadColor(card, leadColor)) ? ObeabePriority[card.number] : 0;
            break;
            case 'UNDEUFE':
                return (this._isLeadColor(card, leadColor)) ? UndeufePriority[card.number] : 0;
        }
    },
    // Retourniert den aktuellen Spielmodus (Trumpf, Obeabe, Undeufe)
    _curGameMode: function() {
        return this.gameType.mode;
    },
    // Retourniert die aktuelle Trumpf Farbe (falls Trumpf gespielt wird), ansonsten ''.
    _curTrumpfColor: function() {
        return (this._curGameMode() === 'TRUMPF') ? this.gameType.trumpfColor : '';
    },
    // Is the current stich already ours?
    _checkCurrentStichForOwnership: function(leadColor) {
        console.log("### CURRENT STICH CARDS: ###")
        for (var i = this.stichCards.length - 1; i >= 0; i--) {
            console.log(this.stichCards[i]);
        }

        var alliedCardPriority;

        switch (this.stichCards.length) {
            case 0:
            case 1:
                return false;
            case 2:
                alliedCardPriority = this._cardPriority(this.stichCards[1], leadColor, this.gameType);
                return (0 < (alliedCardPriority - this._cardPriority(this.stichCards[0], leadColor, this.gameType)));
            break;
            case 3:
                alliedCardPriority = this._cardPriority(this.stichCards[1], leadColor, this.gameType);
                if (0 < (alliedCardPriority - this._cardPriority(this.stichCards[0], leadColor, this.gameType))) {
                    return (0 < (alliedCardPriority - this._cardPriority(this.stichCards[2], leadColor, this.gameType)));
                } else {
                    return false;
                }
        }
    },
    // Zustand des aktuellen Spiels
    _defaultLogAttributes() {
        var gt = this.gameType;
        if (gt.mode === 'TRUMPF') {
            return [ gt.mode, gt.trumpfColor, this.geschoben].join(' / ');
        } else {
            return [ gt.mode, this.geschoben].join(' / ');
        }
    },
    // Retourniert (boolean), ob der Trumpf Bauer in den mitgegebenen Karten ist
    _hasBuur: function(handcards) {
        let trumpfBuur = Card.create(11, this._curTrumpfColor());
        for (var i = handcards.length - 1; i >= 0; i--) {
            if (handcards[i].equals(trumpfBuur)) {
                return true;
            }
        }
        return false;
    },
    // Retourniert (boolean), ob die :card von der Farbe :leadColor ist
    _isLeadColor: function(card, leadColor) {
        return (card.color === leadColor);
    },
    // Retourniert (boolean), ob die :card im :gameType ein Trumpf ist
    _isTrumpf: function(card, gameType) {
        return (gameType.mode === 'TRUMPF') ? (card.color === gameType.trumpfColor) : false;
    },
    // Retourniert einen gewichteten Wert für die Kartenevaluierung beim Trumpfbestimmen
    _mapCardToWeight: function(card, gameType) {
        switch(gameType.mode) {
            case 'TRUMPF':
                return (card.color == gameType.trumpfColor) ? TrumpfWeights[card.number] : NotTrumpfWeights[card.number]; 
            break;
            case 'OBEABE':
                return ObeabeWeights[card.number];
            break;
            case 'UNDEUFE':
                return UndeufeWeights[card.number];
        }
    },
    // Retoruniert den Wert der :card im :gameType bei der Auszählung am Ende
    _mapCardToValue: function(card, gameType) {
        switch(gameType.mode) {
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
    // Ausgeben der Handkarten im Log (sortiert nach Farbe)
    _printHandcards(handcards) {
        console.log('-----');
        console.log('HANDKARTEN:');
        handcards = handcards.sort(handcards[0].sortByColorAndNumber());
        for (var i = handcards.length - 1; i >= 0; i--) {
            console.log(handcards[i].translate());
        }
        console.log('-----');
    }
};

let create = function () {
    let brain = Object.create(Brain);
    return brain;
};

module.exports = {
    create
};
