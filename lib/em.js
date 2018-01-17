'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jmUtils = require('jm-utils');

var _obj = require('./obj');

var _obj2 = _interopRequireDefault(_obj);

var _entity = require('./entity');

var _entity2 = _interopRequireDefault(_entity);

var _factory = require('./factory');

var _factory2 = _interopRequireDefault(_factory);

var _jmLogger = require('jm-logger');

var _jmLogger2 = _interopRequireDefault(_jmLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = _jmLogger2.default.getLogger('jm-ecs');

/**
 * entity manager
 */

var EM = function (_Obj) {
  _inherits(EM, _Obj);

  /**
   * create an entity manager
   * @param {Object} ecs
   * @param {Object} opts
   */
  function EM(ecs) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, EM);

    var _this = _possibleConstructorReturn(this, (EM.__proto__ || Object.getPrototypeOf(EM)).call(this, opts));

    _this._ecs = ecs;
    _this._entityTypes = {};
    _this._pools = {};
    _this._entities = {};
    _this._entitiesByName = {};
    _this._entitiesByTag = {};
    _this.f = new _factory2.default(_this);
    return _this;
  }

  _createClass(EM, [{
    key: 'e',
    value: function e(opts) {
      return new _entity2.default(this, opts);
    }
  }, {
    key: 'addEntityType',
    value: function addEntityType(type, opts) {
      if (this._entityTypes[type]) {
        logger.warn('add entityType already exists for ' + type + ', replaced.');
      }

      this._entityTypes[type] = opts;
      return this;
    }
  }, {
    key: 'addEntityTypes',
    value: function addEntityTypes(opts) {
      for (var type in opts) {
        this.addEntityType(type, opts[type]);
      }
      return this;
    }
  }, {
    key: 'entityType',
    value: function entityType(type) {
      return this._entityTypes[type];
    }
  }, {
    key: '__createEntityFromPool',
    value: function __createEntityFromPool(type, opts, parent) {
      if (!this._entityTypes[type].poolable) return null;
      if (parent) return null;
      if (opts && opts.parent) return null;
      // 如果可池化, 先从池里取
      if (this._pools[type]) {
        var e = this._pools[type].shift();
        if (e) {
          e.emit('reuse', opts);
          this.addEntity(e);
          return e;
        }
      }
      return null;
    }
  }, {
    key: 'createEntity',
    value: function createEntity(type, opts, parent) {
      var e = null;
      e = this.__createEntityFromPool(type, opts, parent);
      if (e) return e;

      var _opts = opts;
      opts = {};
      opts = _jmUtils.utils.cloneDeep(this._entityTypes[type]);
      if (_opts) {
        opts = _jmUtils.utils.merge(opts, _jmUtils.utils.cloneDeep(_opts));
      }

      if (parent) opts.parent = parent;
      e = this.f.create(opts);
      if (!e) {
        return null;
      }

      e.type = type;
      e.addTag(type);
      opts.tags && e.addTags(opts.tags);
      this.addEntity(e);

      this.createEntityChildren(e, opts);

      return e;
    }
  }, {
    key: 'createEntityChildren',
    value: function createEntityChildren(e, opts) {
      // create Children
      for (var i in opts.children) {
        var info = opts.children[i];
        if (!info) continue;
        var o = null;
        var className = info.className || 'jm.Entity';
        if (className === 'jm.Entity') {
          var type = info.type;
          o = this.createEntity(type, info, e);
        }
        if (!e.children) {
          e.children = [];
        }
        e.children.push(o);
      }
    }
  }, {
    key: 'addEntity',
    value: function addEntity(e, tag) {
      if (!e || !e.entityId) {
        return this;
      }

      if (tag) {
        e.addTag(tag);
      }

      this._entities[e.entityId] = e;
      if (e.name) {
        this._entitiesByName[e.name] = e;
      }

      e.emit('add', this);
      this.emit('addEntity', e);

      return this;
    }
  }, {
    key: '__removeEntityToPool',
    value: function __removeEntityToPool(e) {
      var type = e.type;
      if (!this._entityTypes[type].poolable) return false;
      if (e.parent) return false;
      // 如果可池化, 存到池里
      if (!this._pools[type]) this._pools[type] = [];
      var pool = this._pools[type];
      e.emit('unuse');
      pool.push(e);
      return true;
    }
  }, {
    key: 'clearPool',
    value: function clearPool(type) {
      var pool = this._pools[type];
      if (!pool) return;
      this._pools[type] = [];
      pool.forEach(function (e) {
        e.destroy();
      });
      return this;
    }
  }, {
    key: 'clearPools',
    value: function clearPools() {
      for (var type in this._pools) {
        this.clearPool(type);
      }
      return this;
    }
  }, {
    key: 'removeEntity',
    value: function removeEntity(entityId) {
      var e = void 0;
      if ((typeof entityId === 'undefined' ? 'undefined' : _typeof(entityId)) === 'object') {
        e = entityId;
      } else {
        e = this._entities[entityId];
      }
      if (!e) {
        return this;
      }

      this.removeEntityChildren(e);

      e.emit('remove', this);
      this.emit('removeEntity', e);
      delete this._entities[e.entityId];

      if (e.name) {
        delete this._entitiesByName[e.name];
      }

      if (this.__removeEntityToPool(e)) {
        return this;
      } else {
        e.destroy();
      }

      return this;
    }
  }, {
    key: 'removeEntityChildren',
    value: function removeEntityChildren(e) {
      var v = e.children;
      for (var i in v) {
        var _e = v[i];
        this.removeEntity(_e.entityId);
      }
      return this;
    }
  }, {
    key: 'removeEntities',
    value: function removeEntities(v) {
      for (var i in v) {
        this.removeEntity(v[i]);
      }
      return this;
    }
  }, {
    key: 'removeEntitiesByType',
    value: function removeEntitiesByType(type) {
      var v = [];
      for (var i in this._entities) {
        var e = this._entities[i];
        if (e.type === type) v.push(e);
      }
      this.removeEntities(v);
      return this;
    }

    //    getEntities('render')
    //    getEntities('render move tag1')  and
    //    getEntities('render, move, tag1')   or

  }, {
    key: 'getEntities',
    value: function getEntities(selector) {
      var entities = this._entities;
      if (!selector) return entities;
      var v = {};
      // select entities by tags
      if (typeof selector === 'string') {
        var and = false; // flags for multiple
        var or = false;
        var rlist = /\s*,\s*/;
        var rspace = /\s+/;
        var del = void 0;
        // multiple components OR
        if (selector.indexOf(',') !== -1) {
          or = true;
          del = rlist;
        } else if (selector.indexOf(' ') !== -1) {
          and = true;
          del = rspace;
        }
        if (!and && !or) {
          return this._entitiesByTag[selector];
        }
        var tags = selector.split(del);
        var e = void 0;
        for (var entityId in entities) {
          e = entities[entityId];
          if (and) {
            if (!e.hasTagAll(tags)) continue;
          } else if (or) {
            if (!e.hasTagAny(tags)) continue;
          }
          v[entityId] = e;
        }
      }

      return v;
    }
  }, {
    key: 'getEntity',
    value: function getEntity(selector) {
      var v = this.getEntities(selector);
      for (var i in v) {
        return v[i];
      }
      return null;
    }
  }, {
    key: 'update',
    value: function update(opts) {
      this.emit('update', opts);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return {
        ecs: this.ecs,
        entities: this.entities
      };
    }
  }, {
    key: 'ecs',
    get: function get() {
      return this._ecs;
    }
  }, {
    key: 'entityTypes',
    get: function get() {
      return this._entityTypes;
    }
  }, {
    key: 'pools',
    get: function get() {
      return this._pools;
    }
  }, {
    key: 'entities',
    get: function get() {
      return this._entities;
    }
  }, {
    key: 'entitiesByName',
    get: function get() {
      return this._entitiesByName;
    }
  }, {
    key: 'entitiesByTag',
    get: function get() {
      return this._entitiesByTag;
    }
  }]);

  return EM;
}(_obj2.default);

exports.default = EM;
module.exports = exports['default'];