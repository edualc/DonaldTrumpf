'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _hasCardValidator = require('./hasCardValidator');

var _hasCardValidator2 = _interopRequireDefault(_hasCardValidator);

var _angebenValidator = require('./angebenValidator');

var _angebenValidator2 = _interopRequireDefault(_angebenValidator);

var _underTrumpfValidator = require('./underTrumpfValidator');

var _underTrumpfValidator2 = _interopRequireDefault(_underTrumpfValidator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Validation = {
    validate: function validate(tableCards, handCards, cardToPlay) {
        var _this = this;

        var success = true;
        if (tableCards.length === 4) {
            return success;
        }
        this.validationParameters.tableCards = tableCards;
        this.validationParameters.handCards = handCards;
        this.validationParameters.cardToPlay = cardToPlay;

        return this.validators.every(function (validator) {
            return validator.validate(_this.validationParameters).permitted;
        });
    }
};

exports.default = {
    create: function create(gameMode, trumpColor) {
        var validation = Object.create(Validation);
        validation.validators = [];
        validation.errors = [];
        validation.validationParameters = {
            mode: gameMode,
            color: trumpColor
        };

        validation.validators.push(_hasCardValidator2.default);
        validation.validators.push(_angebenValidator2.default);
        validation.validators.push(_underTrumpfValidator2.default);
        return validation;
    }
};