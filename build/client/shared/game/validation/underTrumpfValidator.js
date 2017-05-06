'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _gameMode = require('../gameMode');

var validationSuccess = {
    permitted: true
};

var UnderTrumpfValidator = {
    validate: function validate(validationParameter) {
        var trumpfQuantifier = [6, 7, 8, 10, 12, 13, 14, 9, 11];
        var trumpfColor = validationParameter.color;

        if (validationParameter.tableCards.length === 0 || validationParameter.mode !== _gameMode.GameMode.TRUMPF) {
            return validationSuccess;
        }

        if (validationParameter.cardToPlay.color !== trumpfColor) {
            return validationSuccess;
        }

        var firstCardColor = validationParameter.tableCards[0].color;
        if (firstCardColor === trumpfColor) {
            return validationSuccess;
        }

        var hasOtherThanTrumpf = validationParameter.handCards.some(function (card) {
            return card.color !== trumpfColor;
        });

        if (!hasOtherThanTrumpf) {
            return validationSuccess;
        }

        var highestTrumpfOnTableIndex = -1;
        var cardTrumpfIndex = trumpfQuantifier.indexOf(validationParameter.cardToPlay.number);
        validationParameter.tableCards.forEach(function (card) {
            if (card.color === trumpfColor) {
                highestTrumpfOnTableIndex = Math.max(highestTrumpfOnTableIndex, trumpfQuantifier.indexOf(card.number));
            }
        });

        if (cardTrumpfIndex < highestTrumpfOnTableIndex) {
            return {
                permitted: false,
                message: 'UnderTrumpfValidator: Undetrumpf is not allowed!'
            };
        }

        return validationSuccess;
    }
};

exports.default = UnderTrumpfValidator;