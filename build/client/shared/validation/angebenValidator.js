'use strict';

var _ = require('lodash');
var GameMode = require('../../shared/game/gameMode');

var validationSuccess = {
    permitted: true
};

var AngebenValidator = {
    validate: function validate(validationParameter) {
        if (validationParameter.tableCards.length === 0) {
            return validationSuccess;
        }

        var hasOnlyBuur = function hasOnlyBuur(handCards, leadColor, trumpfColor) {
            if (leadColor === trumpfColor && validationParameter.mode === GameMode.TRUMPF) {
                var trumpfCards = handCards.filter(function (card) {
                    return card.color === trumpfColor;
                });
                if (trumpfCards.length === 1 && trumpfCards[0].number === 11) {
                    return true;
                }
                return false;
            }
            return false;
        };

        if (validationParameter.cardToPlay.color === validationParameter.color) {
            return validationSuccess;
        }

        var leadCard = validationParameter.tableCards[0];
        var hasColorInHand = false;
        validationParameter.handCards.forEach(function (card) {
            if (card.color === leadCard.color) {
                hasColorInHand = true;
            }
        });

        if (hasColorInHand && hasOnlyBuur(validationParameter.handCards, leadCard.color, validationParameter.color)) {
            return validationSuccess;
        }

        if (hasColorInHand && validationParameter.cardToPlay.color !== leadCard.color) {
            return {
                permitted: false,
                message: 'You must play a card of the same color as the first one!'
            };
        }

        return validationSuccess;
    }
};

module.exports = AngebenValidator;