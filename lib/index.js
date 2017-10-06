'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ecs = require('./ecs');

var _ecs2 = _interopRequireDefault(_ecs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (typeof global !== 'undefined' && global) {
  if (global.jm) {
    global.jm.ECS = _ecs2.default;
    global.jm.ecs = function (opts) {
      return new _ecs2.default(opts);
    };
  }
}

exports.default = _ecs2.default;
module.exports = exports['default'];