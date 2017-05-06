'use strict';

var _ = require('lodash');

var HasCardValidator = {
    validate: function validate(validationParameter) {
        var cardToPlay = function cardToPlay(_cardToPlay, handCard) {
            return handCard.equals(_cardToPlay);
        };

        if (validationParameter.handCards.some(cardToPlay.bind(null, validationParameter.cardToPlay))) {
            return {
                permitted: true
            };
        } else {
            return {
                permitted: false,
                message: 'HasCardValidator: Card is not in your hand!'
            };
        }
    }
};

module.exports = HasCardValidator;