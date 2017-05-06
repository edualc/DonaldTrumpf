'use strict';

var _ = require('lodash');
var HandCardValidator = require('./hasCardValidator');
var AngebenValidator = require('./angebenValidator');
var UnderTrumpfValidator = require('./underTrumpfValidator');
var Validation = {
    appendValidator: function appendValidator(validatorFn) {
        this.validators.push(validatorFn);
    },
    validate: function validate(tableCards, handCards, cardToPlay) {
        var success = true;
        this.validationParameters.tableCards = tableCards;
        this.validationParameters.handCards = handCards;
        this.validationParameters.cardToPlay = cardToPlay;
        for (var i = 0; i < this.validators.length; i++) {
            var validity = this.validators[i].validate(this.validationParameters);
            if (!validity.permitted) {
                return false;
            }
        }
        return success;
    }
};
var create = function create(gameMode, trumpColor) {
    var validation = Object.create(Validation);
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
    create: create
};