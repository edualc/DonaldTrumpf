"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IStrategy = exports.IStrategy = function IStrategy() {
	_classCallCheck(this, IStrategy);

	if (new.target === IStrategy) {
		throw new TypeError("Cannot construct Abstract instances directly");
	}
	if (this.bockCount === undefined) {
		throw new TypeError("Must ovverride method");
	}
};

var ObenabeStrategy = exports.ObenabeStrategy = function (_IStrategy) {
	_inherits(ObenabeStrategy, _IStrategy);

	function ObenabeStrategy() {
		_classCallCheck(this, ObenabeStrategy);

		return _possibleConstructorReturn(this, (ObenabeStrategy.__proto__ || Object.getPrototypeOf(ObenabeStrategy)).call(this));
	}

	_createClass(ObenabeStrategy, [{
		key: "bockCount",
		value: function bockCount() {
			return this.bockCount;
		}
	}]);

	return ObenabeStrategy;
}(IStrategy);