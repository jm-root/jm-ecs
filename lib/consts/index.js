'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var BaseErrCode = 800;

exports.default = {
  Err: {
    InvalidComponent: {
      err: BaseErrCode++,
      msg: 'invalid component ${name}'
    },
    SingletonComponent: {
      err: BaseErrCode++,
      msg: 'singleton component ${name} already exists'
    }
  }
};
module.exports = exports['default'];