'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jmErr = require('jm-err');

var _jmErr2 = _interopRequireDefault(_jmErr);

var _jmLogger = require('jm-logger');

var _jmLogger2 = _interopRequireDefault(_jmLogger);

var _obj = require('./obj');

var _obj2 = _interopRequireDefault(_obj);

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

var _em = require('./em');

var _em2 = _interopRequireDefault(_em);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = _jmLogger2.default.getLogger('jm-ecs');

/**
 * using component
 * @param ecs
 * @param C
 * @param name
 * @return {_useC}
 * @private
 */
function _useC(ecs, C, name) {
  var components = ecs._components;
  if (components[name]) {
    logger.warn('use Compoent already exists for ' + name + ', replaced.');
  }
  components[name] = C;
  ecs.emit('use', name, C);
}

function _use(ecs, C, name) {
  if (!C) throw _jmErr2.default.err(_jmErr2.default.Err.FA_PARAMS);

  name || (name = C.class || C.name);
  if (!name) throw _jmErr2.default.err(_jmErr2.default.Err.FA_PARAMS);

  switch (C.type) {
    case 'C':
      return _useC(ecs, C, name);
      break;
    default:
  }
}

/**
 * entity component system
 */

var ECS = function (_Obj) {
  _inherits(ECS, _Obj);

  /**
   * create an entity component system
   * @param opts
   */
  function ECS(opts) {
    _classCallCheck(this, ECS);

    var _this = _possibleConstructorReturn(this, (ECS.__proto__ || Object.getPrototypeOf(ECS)).call(this, opts));

    _this._components = {};
    _this.use(_component2.default);
    return _this;
  }

  /**
   * use module
   * @param {Object} C
   * @param name
   * @return {ECS}
   */


  _createClass(ECS, [{
    key: 'use',
    value: function use(C, name) {
      _use(this, C, name);
      return this;
    }

    /**
     * use modules
     * uses({class:C, name: 'components'})
     * uses(['Component1', 'Component2', {name: 'components3', class:'C'}...'Factory1', 'Factory2'])
     * uses({class: C, name: 'component'}, 'Component2'...'Factory1', 'Factory2')
     * @param opts
     * @return {ECS}
     */

  }, {
    key: 'uses',
    value: function uses() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var opts = _step.value;

          if (Array.isArray(opts)) {
            this.uses.apply(this, _toConsumableArray(opts));
          } else if ((typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) === 'object') {
            this.use(opts.class, opts.name);
          } else {
            this.use(opts);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return this;
    }
  }, {
    key: 'unuse',
    value: function unuse(name) {
      var components = this._components;
      var C = components[name];
      if (C) {
        ecs.emit('unuse', name, C);
      }
      delete components[name];
      return this;
    }
  }, {
    key: 'component',
    value: function component(name) {
      return this._components[name];
    }
  }, {
    key: 'em',
    value: function em(opts) {
      return new _em2.default(this, opts);
    }
  }, {
    key: 'components',
    get: function get() {
      return this._components;
    }
  }]);

  return ECS;
}(_obj2.default);

exports.default = ECS;
module.exports = exports['default'];