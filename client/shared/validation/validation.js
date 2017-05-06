'use strict';

let _ = require('lodash');
let HandCardValidator = require('./hasCardValidator');
let AngebenValidator = require('./angebenValidator');
let UnderTrumpfValidator = require('./underTrumpfValidator');
let Validation = {
    appendValidator: function appendValidator(validatorFn) {
        this.validators.push(validatorFn);
    },
    validate: function validate(tableCards, handCards, cardToPlay) {
        let success = true;
        this.validationParameters.tableCards = tableCards;
        this.validationParameters.handCards = handCards;
        this.validationParameters.cardToPlay = cardToPlay;
        for (let i = 0; i < this.validators.length; i++) {
            let validity = this.validators[i].validate(this.validationParameters);
            if (!validity.permitted) {
                return false;
            }
        }
        return success;
    }
};
let create = function create(gameMode, trumpColor) {
    let validation = Object.create(Validation);
    validation.validators = [];
    validation.errors = [];
    validation.validationParameters = {
        mode: gameMode,
        color: trumpColor
    };
    validation.validators.push(HandCardValidator);
    validation.validators.push(AngebenValidator);
    validation.validators.push(UnderTrumpfValidator);
    return validation;
};
module.exports = {
    create
};