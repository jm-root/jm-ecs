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
 * factory
 */
var F = function (_Obj) {
  _inherits(F, _Obj);

  /**
   * create a factory
   * @param {EM} em - entity manager
   * @param {Object} opts
   */
  function F(em, opts) {
    _classCallCheck(this, F);

    var _this = _possibleConstructorReturn(this, (F.__proto__ || Object.getPrototypeOf(F)).call(this, opts));

    _this.em = em;
    return _this;
  }

  _createClass(F, [{
    key: 'create',
    value: function create() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var em = this.em;
      var e = em.e();
      if (!opts.components) return e;
      if (opts.parent) {
        e.parent = opts.parent;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(opts.components)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var name = _step.value;

          var info = opts.components[name];
          var C = info.className || name;
          info.className && delete info.className;
          e.use(C, info, name);
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

      this.emit('create', e);
      return e;
    }
  }]);

  return F;
}(_obj2.default);

exports.default = F;
module.exports = exports['default'];