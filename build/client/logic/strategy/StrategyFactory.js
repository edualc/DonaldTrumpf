'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.StrategyFactory = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _IStrategy = require('./IStrategy.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StrategyFactory = exports.StrategyFactory = function () {
	function StrategyFactory() {
		_classCallCheck(this, StrategyFactory);
	}

	_createClass(StrategyFactory, [{
		key: 'getStrategies',
		value: function getStrategies() {
			return new _IStrategy.ObenabeStrategy();
		}
	}]);

	return StrategyFactory;
}();