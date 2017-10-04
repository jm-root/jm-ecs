'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _obj = require('./obj');

var _obj2 = _interopRequireDefault(_obj);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * component
 */
var C = function (_Obj) {
  _inherits(C, _Obj);

  /**
     * create a component
     * @param {E} e entity
     * @param {Object} opts
     */
  function C(e, opts) {
    _classCallCheck(this, C);

    var _this = _possibleConstructorReturn(this, (C.__proto__ || Object.getPrototypeOf(C)).call(this, opts));

    _this._entity = e;
    _this.active = true;
    return _this;
  }

  _createClass(C, [{
    key: 'onUse',


    /**
       * on added to an entity
       * @param e
       */
    value: function onUse(e) {}

    /**
       * on removed from an entity
       * @param e
       */

  }, {
    key: 'onUnuse',
    value: function onUnuse(e) {}
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return {
        class: C.alias || C.class
      };
    }
  }, {
    key: 'entity',
    get: function get() {
      return this._entity;
    }
  }, {
    key: 'singleton',
    get: function get() {
      return C.singleton;
    }
  }, {
    key: 'name',
    get: function get() {
      return this._name || C.alias || C.class;
    },
    set: function set(v) {
      if (C.nameReadOnly) return;
      this._name = v;
    }
  }]);

  return C;
}(_obj2.default);

C.type = 'C';
C.class = 'component';
C.singleton = false;
C.nameReadOnly = false;

exports.default = C;
module.exports = exports['default'];