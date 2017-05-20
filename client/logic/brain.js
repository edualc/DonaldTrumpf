'use strict';
/*
 The Brain is the core decision source when reacting to server requests that need to implement decent choosing logic (card, trumpf or schiäbä).
 This implementation basically responds with either default behaviour or random valid cards.
 */

let Validation = require('../shared/validation/validation');
let Card = require('./../shared/deck/card');
let ChanceCalc = require('./ChanceCalc');

// import { StrategyFactory } from './strategy/StrategyFactory';

// let strategies = new StrategyFactory().getStrategies();

// TODO: Evaluierungsstatistik mitführen
let CurrentColorWeights = { color: '', count: 0, trumpfWeight: 0, nonTrumpfWeight: 0 };

// Effektive Kartenwerte beim Auszählen am Ende
let TrumpfValues =    [0,0,0,0,0,0,  0, 0, 0,14,10,20, 3, 4,11]; // Kartenwert für Trumpf
let NotTrumpfValues = [0,0,0,0,0,0,  0, 0, 0, 0,10, 2, 3, 4,11]; // Kartenwert für Nicht-Trumpf
let ObeabeValues =    [0,0,0,0,0,0,  0, 0, 8, 0,10, 2, 3, 4,11]; // Kartenwert bei Obeabe
let UndeufeValues =   [0,0,0,0,0,0, 11, 0, 8, 0,10, 2, 3, 4, 0]; // Kartenwert bei Undeufe

// Gewichtete Kartenwerte (zurzeit "willkürlich" gewichtet)
let TrumpfWeights =    [0,0,0,0,0,0,  1, 2, 3, 8, 4, 9, 5, 6, 7]; // Kartenwert für Trumpf
let NotTrumpfWeights = [0,0,0,0,0,0,  1, 2, 3, 4, 5, 6, 7, 8, 9]; // Kartenwert für Nicht-Trumpf
let ObeabeWeights =    [0,0,0,0,0,0,  1, 1, 1, 2, 2, 5, 7, 8,11]; // Kartenwert bei Obeabe
let UndeufeWeights =   [0,0,0,0,0,0, 11, 8, 6, 5, 2, 2, 1, 1, 1]; // Kartenwert bei Undeufe

// Höherer Wert gewinnt gegen tieferen Wert
let TrumpfPriority =    [0,0,0,0,0,0, 11,12,13,18,14,19,15,16,17]; // Trumpf gewinnt immer gegen Nichttrumpf (+10)
let NotTrumpfPriority = [0,0,0,0,0,0,  1, 2, 3, 4, 5, 6, 7, 8, 9];
let ObeabePriority =    [0,0,0,0,0,0,  1, 2, 3, 4, 5, 6, 7, 8, 9];
let UndeufePriority =   [0,0,0,0,0,0,  9, 8, 7, 6, 5, 4, 3, 2, 1];

let Brain = {
    geschoben: false,
    justPlayedACard: false,
    hadTrumpfInLastStich: true, // shows if the opposing team had given trumpf in the last stich (is used for re-trumpf'ing)
    playedCards: [], // already played cards in the current game
    stichCards: [], // cards that are in the current stich
    trumpfCount: 0,
    stichCount: 0,
    chanceCalc: ChanceCalc,
    amountOfTrumpfCardsForPlayer: 0,

    // skeleton method: returns the gameType to be played
    chooseTrumpf: function (handcards) {
        //CHALLENGE2017: Implement logic to chose game mode which is best suited to your handcards or schiäbä. Consider that this decision ist quite crucial for your bot to be competitive
        
        // Evaluate different options for own cards
        // 1. Which is best for my cards (done)
        // 2. Which is best for my non-trumpf/obeabe/undeufe cards
        // 3. Which is statistically best for my other bot instance
        var topGameType;
        var topGameTypeWeight = 0;

        this._printHandcards(handcards);

        // declare arrays used
        let cardColors = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"], evaluationArray = [];
        // declare multiple variables used
        let currentColorTrumpfWeight, currentColorTrumpfMateWeight, currentColorNonTrumpfWeight, currentColorNonTrumpfMateWeight, currentTrumpfCount, currentGameType, cardToEvaluate, chance;

        // initialize a full deck;
        var fullDeck = handcards[0].getFullDeck();

        // TRUMPF evalaution (all 4 colors)
        // ==========================================
            for (var i = cardColors.length - 1; i >= 0; i--) { // color
                currentColorTrumpfWeight = 0;
                currentColorTrumpfMateWeight = 0;
                currentColorNonTrumpfWeight = 0;
                currentColorNonTrumpfMateWeight = 0;
                currentGameType = { mode: 'TRUMPF', trumpfColor: cardColors[i] };
                // evaluation for player
                for (var j = handcards.length - 1; j >= 0; j--) {
                    if (this._isTrumpf(handcards[j], currentGameType)) {
                        currentColorTrumpfWeight += this._mapCardToWeight(handcards[j], currentGameType);
                    } else {
                        currentColorNonTrumpfWeight += this._mapCardToWeight(handcards[j], currentGameType);
                    }
                }
                // evaluation for mate(s)
                for (var h = fullDeck.length - 1; h >= 0; h--) {
                    cardToEvaluate = fullDeck[h];
                    chance = this.chanceCalc.getChanceToHaveCard(cardToEvaluate, 1); // index 1,2 or 3 works, just NOT 0

                    if (this._isTrumpf(cardToEvaluate, currentGameType)) {
                        currentColorTrumpfMateWeight += (this._mapCardToWeight(cardToEvaluate, currentGameType) * chance);
                    } else {
                        currentColorNonTrumpfMateWeight += (this._mapCardToWeight(cardToEvaluate, currentGameType) * chance);
                    }
                }
                // summary for the current color evaluation
                let trumpfWeight = (((currentColorTrumpfWeight) * 1.2 + (currentColorNonTrumpfWeight / 3) * 0.8) * 2);
                let trumpfMateWeight = (((currentColorTrumpfMateWeight) * 1.2 + (currentColorNonTrumpfMateWeight / 3) * 0.8) * 2);
                evaluationArray.push({ weight: trumpfWeight - trumpfMateWeight, playerWeight: trumpfWeight, mateWeight: trumpfMateWeight, mode: 'TRUMPF', color: cardColors[i] });
            }

        // OBEABE evaluation
        // ==========================================
            currentGameType = { mode: 'OBEABE' };
            let obeabeWeight = 0;
            let obeabeMateWeight = 0;
            // evaluation for player
            for (var i = handcards.length - 1; i >= 0; i--) {
                obeabeWeight += this._mapCardToWeight(handcards[i], currentGameType);
            }
            // evaluation for mate(s)
            for (var i = fullDeck.length - 1; i >= 0; i--) {
                cardToEvaluate = fullDeck[i];
                chance = this.chanceCalc.getChanceToHaveCard(cardToEvaluate, 1); // index 1,2 or 3 works, just NOT 0
                obeabeMateWeight += (this._mapCardToWeight(cardToEvaluate, currentGameType) * chance);
            }
            evaluationArray.push({ weight: obeabeWeight - obeabeMateWeight, playerWeight: obeabeWeight, mateWeight: obeabeMateWeight, mode: 'OBEABE', color: undefined });

        // UNDEUFE evaluation
        // ==========================================
            currentGameType = { mode: 'UNDEUFE' };
            let undeufeWeight = 0;
            let undeufeMateWeight = 0;
            // evaluation for player
            for (var i = handcards.length - 1; i >= 0; i--) {
                undeufeWeight += this._mapCardToWeight(handcards[i], currentGameType);
            }
            // evaluation for mate(s)
            for (var i = fullDeck.length - 1; i >= 0; i--) {
                cardToEvaluate = fullDeck[i];
                chance = this.chanceCalc.getChanceToHaveCard(cardToEvaluate, 1); // index 1,2 or 3 works, just NOT 0
                undeufeMateWeight += (this._mapCardToWeight(cardToEvaluate, currentGameType) * chance);
            }
            evaluationArray.push({ weight: undeufeWeight - undeufeMateWeight, playerWeight: undeufeWeight, mateWeight: undeufeMateWeight, mode: 'UNDEUFE', color: undefined });

        // evaluationArray evaluation to find best mode
        // ==========================================
        console.log('---###---');
        let bestMode = evaluationArray[0];
        for (var i = evaluationArray.length - 1; i >= 0; i--) {
            console.log(
                "weight:\t" + parseFloat(evaluationArray[i].weight).toFixed(2) + 
                "\tplayerWeight:\t" + parseFloat(evaluationArray[i].playerWeight).toFixed(2) + 
                "\tmateWeight:\t" + parseFloat(evaluationArray[i].mateWeight).toFixed(2) + 
                "\tmode:\t" + evaluationArray[i].mode + 
                "\tcolor:\t" + evaluationArray[i].color
            );
            if (evaluationArray[i].weight >= bestMode.weight) {
                bestMode = evaluationArray[i];
            }
        }
        console.log('---###---');

        // Set gameType according to evaluation above
        let gameType = { "mode": bestMode.mode, "trumpfColor": (bestMode.mode === 'TRUMPF') ? bestMode.color : undefined };
        return gameType;
    },
    gameMode: function (gameType) {
        this.geschoben = gameType.mode === "SCHIEBE"; //just remember if it's a geschoben match
        this.gameType = gameType;
    },
    // skeleton method: returns the card to be played
    chooseCard: function (handcards, tableCards) {
        //CHALLENGE2017: Implement logic to choose card so your bot will beat all the others. Keep in mind that your counterpart is another instance of your bot

        // Update the current statistics
        this.updateChanceCalc(handcards, tableCards);

        if ((this.stichCount === 0) && (this.gameType.mode === 'TRUMPF')) {
            this.amountOfTrumpfCardsForPlayer = this.chanceCalc._trumpfCountForPlayer(this.gameType.trumpfColor);
        }

        // get all the legal cards to play at this time
        var validCards = this.getPossibleCards(handcards, tableCards);
        var stichIsOurs = false;
        var cardToPlay = {};

        // We are the first to play this stich
        if (tableCards.length === 0) {
            console.log("-----\r\n#####" + ' Wir spielen die erste Karte! ' + this._defaultLogAttributes() + "\r\n-----");

        // A color has been played, we have to react to already played Cards
        } else {
            // Angespielte Farbe
            var leadColor = tableCards[0].color;
            console.log("-----\r\n#####" + leadColor + ' wurde angespielt. ' + this._defaultLogAttributes() + "\r\n-----");
        
            stichIsOurs = this._checkCurrentStichForOwnership(leadColor);
        }

        console.log("-----\r\n###### Ist der Stich uns? " + stichIsOurs + "\r\n-----");

        // /**
        //  * OLD IMPLEMENTATION
        //  */
        // // differentiate between the different gamemodes
        // switch (this.gameType.mode) {
        //     case 'TRUMPF':
        //         let trumpfBuur = Card.create(11, this._curTrumpfColor());
        //         let trumpfNell = Card.create(9, this._curTrumpfColor());
        //         let trumpfAss = Card.create(14, this._curTrumpfColor());

        //         // First stich: Who has Trumpf?
        //         // (If first stich and this instance just chose Trumpf)
        //         if ((this.stichCount === 0) && (this.stichCards.length === 0)) {
        //             // If you have both Nell + Ass, play Ass
        //             if ((validCards.indexOf(trumpfNell) >= 0) && (validCards.indexOf(trumpfAss) >= 0)) {
        //                 return trumpfAss;
        //             }
        //             // If you have both Buur + Ass, play Ass
        //             if ((validCards.indexOf(trumpfAss) >= 0) && (validCards.indexOf(trumpfBuur) >= 0)) {
        //                 return trumpfAss;
        //             }
        //             // If you have both Buur + Nell, play Nell
        //             if ((validCards.indexOf(trumpfNell) >= 0) && (validCards.indexOf(trumpfBuur) >= 0)) {
        //                 return trumpfNell;
        //             }

        //             // What Trumpf Cards do I have?
        //             let self = this;
        //             let currentTrumpfCards = [];
        //             currentTrumpfCards = validCards.filter(
        //                 function(c) {
        //                     return self._isTrumpf(c, self.gameType);
        //                 }, this
        //             );

        //             let highestTrumpf = currentTrumpfCards[0];

        //             for (var i = currentTrumpfCards.length - 1; i >= 0; i--) {
        //                 if (self._cardPriority(currentTrumpfCards[i], currentTrumpfCards[i].color, self.gameType) > self._cardPriority(highestTrumpf, highestTrumpf.color, self.gameType)) {
        //                     highestTrumpf = currentTrumpfCards[i];
        //                 }
        //             }

        //             // Play highest Trumpf in the beginning to draw them out.
        //             return highestTrumpf;
        //         // Any Stich where this instance didn't make trumpf or it isn't the first stich
        //         } else {
        //             // I am first to play this stich
        //             if (this.stichCards.length === 0) {
        //                 let highestCard = validCards[0];

        //                 let self = this;
        //                 for (var i = validCards.length - 1; i >= 0; i--) {
        //                     if (self._cardPriority(validCards[i], validCards[i].color, self.gameType) > self._cardPriority(highestCard, highestCard.color, self.gameType)) {
        //                         highestCard = validCards[i];
        //                     }
        //                 }

        //                 return highestCard;

        //             // Someone already played before me
        //             } else {
        //                 let highestCard = validCards[0];
        //                 let lowestCard = validCards[0];

        //                 let self = this;
        //                 for (var i = validCards.length - 1; i >= 0; i--) {
        //                     if (self._cardPriority(validCards[i], validCards[i].color, self.gameType) > self._cardPriority(highestCard, validCards[i].color, self.gameType)) {
        //                         highestCard = validCards[i];
        //                     }
        //                     // TODO: Wieso ist hier validCards[i] besser als v0.1, mit leadColor (was an sich logischer wäre) schlechter?
        //                     if (self._cardPriority(validCards[i], validCards[i].color, self.gameType) < self._cardPriority(lowestCard, validCards[i].color, self.gameType)) {
        //                         lowestCard = validCards[i];
        //                     }
        //                 }

        //                 // Falls der Stich bereits uns gehört, spiele die schlechteste Karte
        //                 // TESTED: ist sinnvoll
        //                 return stichIsOurs ? lowestCard : highestCard;
        //             }
        //         }

        //     break;
        //     case 'OBEABE':
        //     case 'UNDEUFE':
        //         // For now, just play the highest card possible
        //         let highestCard = validCards[0];
        //         // compare all the valid cards for their priority and pick one the highest card
        //         for (var i = validCards.length - 1; i >= 0; i--) {
        //             if (this._cardPriority(validCards[i], validCards[i].color, this.gameType) > this._cardPriority(highestCard, highestCard.color, this.gameType)) {
        //                 highestCard = validCards[i];
        //             }
        //         }
        //         return highestCard;
        // }

        switch (this.gameType.mode) {
            case 'TRUMPF':
                // =================================================================================
                // TRUMPF
                // =================================================================================
                
                console.log('\t\t #### TRUMPF #### ' 
                    + tableCards.length + ' Karten sind gespielt! Angespielte Farbe: ' 
                    + ((tableCards.length > 0) ? tableCards[0].color : '')
                    + ' - Trumpffarbe: ' + this.gameType.trumpfColor);

                // Trümpfe ziehen?
                if (this._shouldIPlayTrumpf(this.stichCount)) {
                    cardToPlay = this._evaluateWhichTrumpfToPlay(validCards);
                } else {
                    // keine Trümpfe ziehen
                    switch (tableCards.length) {
                        // Bot darf ausspielen, 2 Gegner (IDs 1,3) spielen nach Bot
                        case 0:
                            cardToPlay = this._evaluatePotentialWinningStichCards(validCards, [1, 3]);
                        break;
                        // Nur ein Gegner (ID 1) spielt nach Bot
                        case 1:
                            // TODO: ... _checkCurrentStichOwnershipChance does it make sense here?
                            if (this._checkCurrentStichForOwnership(leadColor) 
                                    && this._checkCurrentStichOwnershipChance(validCards, tableCards, 1)
                            ) {
                                cardToPlay = this._playLogically(validCards, tableCards);
                            } else {
                                cardToPlay = this._playInvaluableCard(validCards, tableCards, leadColor);
                            }
                            // TODO: Maybe other player can still make the stich?
                            // makes it sense to count on it?
                        break;
                        // Nur ein Gegner (ID 1) spielt nach Bot
                        case 2:
                            if (this._checkCurrentStichForOwnership(leadColor) 
                                    && this._checkCurrentStichOwnershipChance(validCards, tableCards, 1)
                            ) {
                                cardToPlay = this._playLogically(validCards, tableCards);
                            } else {
                                cardToPlay = this._playInvaluableCard(validCards, tableCards, leadColor);
                            }
                        break;
                        // Niemand spielt nach Bot
                        case 3:
                            if (this._checkCurrentStichForOwnership(leadColor)) {
                                // Stich ist uns, SCHMIEREN!
                                cardToPlay = this._playValuableCard(validCards, tableCards, leadColor);
                            } else {
                                // Stich ist noch nicht uns, versuche zu holen
                                cardToPlay = this._playTryingToGetStich(validCards, tableCards, leadColor);
                            }
                    }
                }

            break;
            case 'OBEABE':
                // =================================================================================
                // OBEABE
                // =================================================================================
                
                console.log('\t\t #### OBEABE #### ' 
                    + tableCards.length 
                    + ' Karten sind gespielt! Angespielte Farbe: ' 
                    + ((tableCards.length > 0) ? tableCards[0].color : ''));

            case 'UNDEUFE':
                // =================================================================================
                // UNDEUFE
                // =================================================================================
                
                console.log('\t\t #### UNDEUFE #### ' 
                    + tableCards.length 
                    + ' Karten sind gespielt! Angespielte Farbe: ' 
                    + ((tableCards.length > 0) ? tableCards[0].color : ''));

                switch (tableCards.length) {
                    // Bot darf ausspielen, 2 Gegner (IDs 1,3) spielen nach Bot
                    case 0:
                        cardToPlay = this._evaluatePotentialWinningStichCards(validCards, [1, 3]);
                    break;
                    // Nur ein Gegner (ID 1) spielt nach Bot
                    case 1:
                        // TODO: ... _checkCurrentStichOwnershipChance does it make sense here?
                        if (this._checkCurrentStichForOwnership(leadColor) 
                                && this._checkCurrentStichOwnershipChance(validCards, tableCards, 1)
                        ) {
                            cardToPlay = this._playLogically(validCards, tableCards);
                        } else {
                            cardToPlay = this._playInvaluableCard(validCards, tableCards, leadColor);
                        }
                        // TODO: Maybe other player can still make the stich?
                        // makes it sense to count on it?
                    break;
                    // Nur ein Gegner (ID 1) spielt nach Bot
                    case 2:
                        if (this._checkCurrentStichForOwnership(leadColor) 
                                && this._checkCurrentStichOwnershipChance(validCards, tableCards, 1)
                        ) {
                            cardToPlay = this._playLogically(validCards, tableCards);
                        } else {
                            cardToPlay = this._playInvaluableCard(validCards, tableCards, leadColor);
                        }
                    break;
                    // Niemand spielt nach Bot
                    case 3:
                        if (this._checkCurrentStichForOwnership(leadColor)) {
                            // Stich ist uns, SCHMIEREN!
                            cardToPlay = this._playValuableCard(validCards, tableCards, leadColor);
                        } else {
                            // Stich ist noch nicht uns, versuche zu holen
                            cardToPlay = this._playTryingToGetStich(validCards, tableCards, leadColor);
                        }
                }
        }

        this.justPlayedACard = true;

        if (cardToPlay === {}) {
            cardToPlay = validCards[0];
        }

        return cardToPlay
    },
    /**
     * Check and return the card to be played, considering players :playerIdArray
     * chances.
     */
    _evaluatePotentialWinningStichCards: function(validCards, playerIdArray) {
        let currentNonTrumpfCards = [];
        
        // which cards shall I play?
        if (this.gameType.mode === 'TRUMPF') {
            let self = this;
            currentNonTrumpfCards = validCards.filter(
                function(c) {
                    return !self._isTrumpf(c, self.gameType);
                }, this
            );
        }

        // if not-trumpf or only trumpfs in hand
        if (currentNonTrumpfCards.length < 1) {
            currentNonTrumpfCards = validCards;
        }

        // TODO: Bessere strategie als "play highest card"
        var cardToPlay = currentNonTrumpfCards[0];
        for (var cntc = 0; cntc < currentNonTrumpfCards.length; cntc++) {
            if (this._cardPriority(currentNonTrumpfCards[cntc], currentNonTrumpfCards[cntc].color, this.gameType) > this._cardPriority(cardToPlay, currentNonTrumpfCards[cntc].color, this.gameType)) {
                cardToPlay = currentNonTrumpfCards[cntc];
            }
        }

        console.log('\t\t #### _evaluatePotentialWinningStichCards #### playing card: ' + cardToPlay);

        return cardToPlay;
    },
    /**
     * Try and evaluate if the current Stich is already won considering
     * the cards that might be played by player :playerId
     */
    _checkCurrentStichOwnershipChance: function(validCards, tableCards, playerId) {

        console.log('################################################\n################################################\n################################################\n'
            + '\n alidCards: \t' + JSON.stringify(validCards) 
            + '\n tableCards: \t' + JSON.stringify(tableCards) 
            + '\n playerId: \t' + playerId);

        var chanceForOtherPlayerToBeatMyCard = 1;
        var highestCard = validCards[0];
        var leadColor = tableCards[0].color;
        var stichIsOurs = false;

        if (tableCards.length === 1) {
            // TODO
            highestCard = tableCards[0];
            chanceForOtherPlayerToBeatMyCard = 1;
        }

        if (tableCards.length === 2) {
            if (this._cardPriority(tableCards[0], leadColor, this.gameType) < this._cardPriority(tableCards[1], leadColor, this.gameType)) {
                highestCard = tableCards[1];
                stichIsOurs = true;
            } else {
                highestCard = tableCards[0];
            }

            var tmpChances = 0;
            for (var c = 0; c < 4; c ++) {
                for (var n = 6; n < 15; n++) {

                    // enemy player must have a chance to have the card in question
                    if (this.chanceCalc.chanceToHaveCard[playerId][c][n] > 0) {
                        var cardToCheck = Card.create(n , this.chanceCalc.mapColorIndexToColor(c));

                        // that card must beat the currently highest card
                        if (this._cardPriority(cardToCheck, leadColor, this.gameType) > this._cardPriority(highestCard, leadColor, this.gameType)) {
                            tmpChances += this.chanceCalc.getChanceToHaveCardInDeck(cardToCheck, playerId, 9 - this.stichCount + 1);
                        }
                    }
                }
            }

            chanceForOtherPlayerToBeatMyCard = tmpChances;
        }
        
        console.log('\t\t #### _checkCurrentStichOwnershipChance #### chance: ' + chanceForOtherPlayerToBeatMyCard);

        // TODO: adjust chance according to points / time
        return (chanceForOtherPlayerToBeatMyCard > 0.67) ? false : true;
    },
    /**
     * Make sure you play the right trumpf to keep playing or to save buur
     */
    _evaluateWhichTrumpfToPlay: function(validCards) {
        let trumpfBuur = Card.create(11, this._curTrumpfColor());
        let trumpfNell = Card.create(9, this._curTrumpfColor());
        let trumpfAss = Card.create(14, this._curTrumpfColor());

        if ((validCards.indexOf(trumpfNell) >= 0) && (validCards.indexOf(trumpfAss) >= 0)) {
            console.log('\t\t #### _evaluateWhichTrumpfToPlay #### chance: ' + trumpfAss);
            return trumpfAss;
        }
        // If you have both Buur + Ass, play Ass
        if ((validCards.indexOf(trumpfAss) >= 0) && (validCards.indexOf(trumpfBuur) >= 0)) {
            console.log('\t\t #### _evaluateWhichTrumpfToPlay #### chance: ' + trumpfAss);
            return trumpfAss;
        }
        // If you have both Buur + Nell, play Nell
        if ((validCards.indexOf(trumpfNell) >= 0) && (validCards.indexOf(trumpfBuur) >= 0)) {
            console.log('\t\t #### _evaluateWhichTrumpfToPlay #### chance: ' + trumpfNell);
            return trumpfNell;
        }

        let self = this;
        let currentTrumpfCards = [];
        let trumpfCardsToEvaluate = [];

        currentTrumpfCards = validCards.filter(
            function(c) {
                return self._isTrumpf(c, self.gameType);
            }, this
        );

        trumpfCardsToEvaluate = currentTrumpfCards;

        // dont play nell or ass if buur isn't gone
        if (!this.chanceCalc.cardWasPlayed(trumpfBuur)) {
            trumpfCardsToEvaluate = currentTrumpfCards.filter(
                function(c) {
                    return !(c.equals(trumpfAss) || c.equals(trumpfNell))
                }, this
            );
        }

        if (trumpfCardsToEvaluate.length > 0) {
            trumpfCardsToEvaluate = currentTrumpfCards;
        }

        if (trumpfCardsToEvaluate.indexOf(trumpfNell) >= 0) {
            console.log('\t\t #### _evaluateWhichTrumpfToPlay #### chance: ' + trumpfNell);
            return trumpfNell;
        }

        if (trumpfCardsToEvaluate.indexOf(trumpfAss) >= 0) {
            console.log('\t\t #### _evaluateWhichTrumpfToPlay #### chance: ' + trumpfAss);
            return trumpfAss;
        }

        var bestTrumpfToPlay = trumpfCardsToEvaluate[0];
        for (var tc = 0; tc < trumpfCardsToEvaluate.length; tc++) {
            if (trumpfCardsToEvaluate[tc].number > bestTrumpfToPlay.number) {
                bestTrumpfToPlay = trumpfCardsToEvaluate[tc];
            }
        }

        console.log('\t\t #### _evaluateWhichTrumpfToPlay #### chance: ' + bestTrumpfToPlay);
        return bestTrumpfToPlay;
    },
    /**
     * Play a card that isn't giving points, isn't opening up bock-spots or
     * is just generally a "bad" card
     */
    _playInvaluableCard: function(validCards, tableCards, leadColor) {
        // For now, just play the highest card possible
        let leastValuableCard = validCards[0];

        // compare all the valid cards for their priority and pick one the highest card
        for (var i = validCards.length - 1; i >= 0; i--) {
            if (this._cardPriority(validCards[i], leadColor, this.gameType) < this._cardPriority(leastValuableCard, leadColor, this.gameType)) {
                leastValuableCard = validCards[i];
            }
        }

        console.log('\t\t #### _playInvaluableCard #### playing:' + leastValuableCard + '\n of: \t' + JSON.stringify(validCards));

        return leastValuableCard;
    },
    /**
     * Playa card that makes sense according to the cards that player :playerId might
     * play after you
     */
    _playLogically: function(validCards, tableCards, playerId) {
        // TODO: bessere strategie als "best card"
        let highestCard = validCards[0];

        let self = this;
        for (var i = validCards.length - 1; i >= 0; i--) {
            if (self._cardPriority(validCards[i], validCards[i].color, self.gameType) > self._cardPriority(highestCard, validCards[i].color, self.gameType)) {
                highestCard = validCards[i];
            }
        }

        console.log('\t\t #### _playLogically #### playing card: ' + highestCard);

        return highestCard;
    },
    /**
     * You are last to play, if you can, get the stich at any cost (and try to use a
     * card that is worth a lot of points)
     */
    _playTryingToGetStich: function(validCards, tableCards, leadColor) {
        let stichBeatingCards = new Array;
        let stichBeatingCard = new Object;
        let highestTableCard = tableCards[0];

        // which is the highest tablecard?
        for (var t = 0; t < tableCards.length; t++) {
            if (this._cardPriority(tableCards[t], leadColor, this.gameType) > this._cardPriority(highestTableCard, leadColor, this.gameType)) {
                highestTableCard = tableCards[t];
            }
        }

        // get all the cards that CAN beat the stich
        for (var v = 0; v < validCards.length; v++) {
            if (this._cardPriority(validCards[v], leadColor, this.gameType) > this._cardPriority(highestTableCard, leadColor, this.gameType)) {
                stichBeatingCards.push(validCards[v]);
            }
        }

        console.log('\t\t #### _playTryingToGetStich #### ' + JSON.stringify(stichBeatingCards));

        // no chance to beat
        if (stichBeatingCards.length < 1) {
            return this._playInvaluableCard(validCards, tableCards, leadColor);
        } else {
            // there are cards that can get the current stich
            // TODO: make sure you choose the best of them
            
            // get "worst" stich beating card
            stichBeatingCard = stichBeatingCards[0];
            for (var sbc = 0; sbc < stichBeatingCards.length; sbc++) {
                if (this._cardPriority(stichBeatingCards[sbc], leadColor, this.gameType) < this._cardPriority(stichBeatingCard, leadColor, this.gameType)) {
                    stichBeatingCard= stichBeatingCards[sbc];
                }
            }

            return stichBeatingCard;
        }
    },
    /**
     * Play any card that is valuable by points, but not necessarily a high card (ass) if
     * you give up bocks for/with it
     */
    _playValuableCard: function(validCards, tableCards, leadColor) {
        var possibleValuableCards = [];
        var valuableCard = {};
        var valuableCardObject = {};

        switch (this.gameType.mode) {
            case 'TRUMPF':
                for (var v = 0; v < validCards.length; v++) {
                    if (validCards[v].number === 10) {
                        possibleValuableCards.push({
                            card: validCards[v],
                            priority: ((validCards[v].color === this.gameType.trumpfColor) ? 2 : 1)
                        });
                    }
                    if (validCards[v].number === 14) {
                        possibleValuableCards.push({
                            card: validCards[v],
                            priority: ((validCards[v].color === this.gameType.trumpfColor) ? 4 : 3)
                        });
                    }
                }

                console.log('\t\t #### _playValuableCard #### ' + JSON.stringify(possibleValuableCards));

                // keine karten dieser art gefunden
                if (possibleValuableCards.length < 1) {
                    // just match accordingly
                    valuableCard = validCards[0];
                    
                    // compare all the valid cards for their priority and pick one the lowest card,
                    // as you want to keep strong ones
                    for (var i = validCards.length - 1; i >= 0; i--) {
                        if (this._cardPriority(validCards[i], this.gameType.trumpfColor, this.gameType) < this._cardPriority(valuableCard, this.gameType.trumpfColor, this.gameType)) {
                            valuableCard = validCards[i];
                        }
                    }

                    return valuableCard;
                } else {
                    // get the "best" valuableCard from the Array
                    valuableCardObject = possibleValuableCards[0];
                    for (var pvc = 0; pvc < possibleValuableCards.length; pvc++) {
                        if (possibleValuableCards[pvc].priority < valuableCardObject.priority) {
                            valuableCardObject = possibleValuableCards[pvc];
                        }
                    }

                    return valuableCardObject.card;
                }
            break;
            case 'OBEABE':
                for (var v = 0; v < validCards.length; v++) {
                    if (validCards[v].number === 10) {
                        possibleValuableCards.push({
                            card: validCards[v],
                            priority: ((validCards[v].color === this.gameType.trumpfColor) ? 2 : 1)
                        });
                    }
                    if (validCards[v].number === 8) {
                        possibleValuableCards.push({
                            card: validCards[v],
                            priority: ((validCards[v].color === this.gameType.trumpfColor) ? 4 : 3)
                        });
                    }
                    if (validCards[v].number === 14) {
                        possibleValuableCards.push({
                            card: validCards[v],
                            priority: ((validCards[v].color === this.gameType.trumpfColor) ? 6 : 5)
                        });
                    }
                }

                console.log('\t\t #### _playValuableCard #### ' + JSON.stringify(possibleValuableCards));

                // keine karten dieser art gefunden
                if (possibleValuableCards.length < 1) {
                    // just match accordingly
                    valuableCard = validCards[0];
                    
                    // compare all the valid cards for their priority and pick one the lowest card,
                    // as you want to keep strong ones
                    for (var i = validCards.length - 1; i >= 0; i--) {
                        if (this._cardPriority(validCards[i], leadColor, this.gameType) < this._cardPriority(valuableCard, leadColor, this.gameType)) {
                            valuableCard = validCards[i];
                        }
                    }
                    return valuableCard;

                } else {
                    // get the "best" valuableCard from the Array
                    valuableCardObject = possibleValuableCards[0];
                    for (var pvc = 0; pvc < possibleValuableCards.length; pvc++) {
                        if (possibleValuableCards[pvc].priority < valuableCardObject.priority) {
                            valuableCardObject = possibleValuableCards[pvc];
                        }
                    }

                    return valuableCardObject.card;
                }
            break;
            case 'UNDEUFE':
                for (var v = 0; v < validCards.length; v++) {
                    if (validCards[v].number === 14) {
                        possibleValuableCards.push({
                            card: validCards[v],
                            priority: ((validCards[v].color === this.gameType.trumpfColor) ? 2 : 1)
                        });
                    }
                    if (validCards[v].number === 8) {
                        possibleValuableCards.push({
                            card: validCards[v],
                            priority: ((validCards[v].color === this.gameType.trumpfColor) ? 4 : 3)
                        });
                    }
                    if (validCards[v].number === 10) {
                        possibleValuableCards.push({
                            card: validCards[v],
                            priority: ((validCards[v].color === this.gameType.trumpfColor) ? 6 : 5)
                        });
                    }
                }

                console.log('\t\t #### _playValuableCard #### ' + JSON.stringify(possibleValuableCards));

                // keine karten dieser art gefunden
                if (possibleValuableCards.length < 1) {
                    // just match accordingly
                    valuableCard = validCards[0];
                    
                    // compare all the valid cards for their priority and pick one the lowest card,
                    // as you want to keep strong ones
                    for (var i = validCards.length - 1; i >= 0; i--) {
                        if (this._cardPriority(validCards[i], leadColor, this.gameType) < this._cardPriority(valuableCard, leadColor, this.gameType)) {
                            valuableCard = validCards[i];
                        }
                    }
                    return valuableCard;

                } else {
                    // get the "best" valuableCard from the Array
                    valuableCardObject = possibleValuableCards[0];
                    for (var pvc = 0; pvc < possibleValuableCards.length; pvc++) {
                        if (possibleValuableCards[pvc].priority < valuableCardObject.priority) {
                            valuableCardObject = possibleValuableCards[pvc];
                        }
                    }

                    return valuableCardObject.card;
                }
        }
    },
    /**
     * Should I Play Trumpf in the beinning of the game to draw them out
     * and see if everyone has them (make some players "have" to play all theirs?)
     */
    _shouldIPlayTrumpf: function(stichCount, trumpfColor) {
        if ((this.amountOfTrumpfCardsForPlayer > stichCount + 1) 
            && (this._playerHasTrumpf(1, trumpfColor) 
                || this._playerHasTrumpf(3, trumpfColor)
            )
        ) {
            return true;
        } else {
            return false;
        }
    },
    // can player :playerId still have trumpfs?
    _playerHasTrumpf: function(playerId, trumpfColor) {
        return this.chanceCalc.playerHasColor[playerId][this.chanceCalc.mapColorToColorIndex(trumpfColor)] === 1
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
    resetPlayedCards: function(handcards) {
        this.playedCards = [];
        this.trumpfCount = 0;
        this.hadTrumpfInLastStich = true;
        this.stichCount = 0;
        this.stichCards = new Array;
        this.amountOfTrumpfCardsForPlayer = 0;

        // RESET chanceCalc
        this.chanceCalc = null;
        this.chanceCalc = ChanceCalc.create();
        this.chanceCalc.initialize(handcards);
    },
    // this method handles statistics and counters for cards played in this game
    // and add :lastPlayedCard to the already played cards
    registerCardWasPlayed: function(lastPlayedCard, playedCards) {
        this.stichCards = playedCards;
        
        this.chanceCalc.registerCardWasPlayed(lastPlayedCard, playedCards, this.stichCount);

        this.playedCards.push(lastPlayedCard);
        if (this._isTrumpf(lastPlayedCard, this.gameType)) {
            this.trumpfCount += 1;
        }

        if (this.justPlayedACard) {
            this.justPlayedACard = false;
        }
    },
    // this method keeps track of the current stich.
    registerStichCompleted: function(data) {
        this.stichCount += 1;
        this.stichCards = new Array(4);

        this.chanceCalc.registerStichCompleted(data);
    },
    // skeleton method
    setValidation: function (gameMode, trumpfColor) {
        this.validation = Validation.create(gameMode, trumpfColor);
    },
    // Gives the current table and handcards to the chanceCalc
    updateChanceCalc: function(handcards, tableCards) {
        this.chanceCalc.update(handcards, tableCards, this.gameType);
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
    _calculateChanceOfStichSuccess: function(leadColor, cardToBePlayed) {
        switch (this.stichCards.length) {
            case 0:
            case 1:
                return false;
            case 2:
                return false;
            break;
            case 3:
                return false;
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
