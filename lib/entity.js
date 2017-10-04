'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _jmTag = require('jm-tag');

var _jmTag2 = _interopRequireDefault(_jmTag);

var _jmErr = require('jm-err');

var _jmErr2 = _interopRequireDefault(_jmErr);

var _obj = require('./obj');

var _obj2 = _interopRequireDefault(_obj);

var _consts = require('./consts');

var _consts2 = _interopRequireDefault(_consts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Err = _consts2.default.Err;

var guid = 1;

function isEmptyObject(e) {
  var t = void 0;
  for (var _t in e) {
    return false;
  }
  return true;
}

var E = function (_Obj) {
  _inherits(E, _Obj);

  function E(em, opts) {
    _classCallCheck(this, E);

    var _this = _possibleConstructorReturn(this, (E.__proto__ || Object.getPrototypeOf(E)).call(this, opts));

    _jmTag2.default.enableTag(_this);

    _this._em = em;
    _this._ecs = em.ecs;
    _this._components = {};
    _this._componentsByClass = {};
    _this._componentGUID = 1;

    _this.active = true;
    _this.entityId = guid++;

    _this.on('addTag', function (tag) {
      em._entitiesByTag[tag] || (em._entitiesByTag[tag] = {});
      em._entitiesByTag[tag][_this.entityId] = _this;
    });

    _this.on('removeTag', function (tag) {
      var o = em._entitiesByTag[tag];
      if (!o) return;
      delete o[_this.entityId];
      if (isEmptyObject(o)) {
        delete em._entitiesByTag[tag];
      }
    });
    return _this;
  }

  _createClass(E, [{
    key: 'destroy',
    value: function destroy() {
      _get(E.prototype.__proto__ || Object.getPrototypeOf(E.prototype), 'destroy', this).call(this);
      this.removeAllComponents();
      this.removeAllTags();
    }
  }, {
    key: 'use',
    value: function use(C, opts, name) {
      var ecs = this.ecs;
      if (typeof C === 'string') {
        name || (name = C);
        C = ecs.component(C);
        if (!C) throw _jmErr2.default.err(Err.InvalidComponent, { name: C });
      }
      if (!C) throw _jmErr2.default.err(_jmErr2.default.Err.FA_PARAMS);

      var c = new C(this, opts);

      var components = this._components;
      var componentsByClass = this._componentsByClass;
      name || (name = C.alias || C.class || C.name);
      var cClassName = C.alias || C.class;

      var bUsedName = name in components;
      if (bUsedName) {
        if (C.singleton) throw _jmErr2.default.err(Err.SingletonComponent, { name: name });
        name = cClassName + this._componentGUID++;
      }

      componentsByClass[cClassName] || (componentsByClass[cClassName] = {});
      var vByClass = componentsByClass[cClassName];

      components[name] = c;
      vByClass[name] = c;
      this[name] = c;
      this.addTag(cClassName);
      if (C.alias) this.addTag(C.alias);

      c.onUse(this);
      c.emit('use', this);
      this.emit('use', c);

      return this;
    }
  }, {
    key: 'unuse',
    value: function unuse(C_or_name) {
      var components = this._components;
      var componentsByClass = this._componentsByClass;
      var C = C_or_name;
      if (typeof C === 'string') {
        C = components[C];
      }
      if (!C) return this;

      var name = c.name;
      var cClassName = c.className;
      var v = componentsByClass[cClassName];
      delete components[name];
      delete v[name];
      delete this[name];
      this.removeTag(cClassName);

      c.onUnuse(this);
      c.emit('unuse', this);
      this.emit('unuse', c);
      c.destroy();
      return this;
    }
  }, {
    key: 'removeChild',
    value: function removeChild(e) {
      this.em.removeEntity(e.entityId);
      this.children = _.without(this.children, e);
      e.destroy();
    }
  }, {
    key: 'removeFromParent',
    value: function removeFromParent() {
      if (this.parent) {
        this.parent.removeChild(this);
      } else {
        this.em.removeEntity(this.entityId);
      }
    }
  }, {
    key: 'removeComponents',
    value: function removeComponents(className) {
      var v = this.getComponents(className);
      for (var i in v) {
        this.unuse(i);
      }
      delete this._componentsByClass[className];
      this.emit('removeComponents', className);
      return this;
    }
  }, {
    key: 'removeAllComponents',
    value: function removeAllComponents() {
      var v = this._components;
      for (var i in v) {
        this.unuse(i);
      }
      this.emit('removeAllComponents');
      return this;
    }
  }, {
    key: 'getComponent',
    value: function getComponent(name) {
      return this._components[name];
    }
  }, {
    key: 'getComponents',
    value: function getComponents(className) {
      return this._componentsByClass[className];
    }

    /**
     * 去掉entityType中已经定义的相同部分
     */

  }, {
    key: '_clip',
    value: function _clip(origin, target) {
      if (!origin) {
        return;
      }

      var obj = target;

      for (var key in target) {
        var t = target[key];
        var o = origin[key];
        if (_.isObject(t)) {
          if (o) {
            this._clip(o, t);
          }
          if (_.isEmpty(t)) {
            delete target[key];
          }
          continue;
        }

        if (t === o) {
          delete target[key];
        }
      }
    }

    // toJSON() {
    //     let em = this.em;
    //     let type = this.type;
    //     let et = em.entityType(type);
    //
    //     let opts = {
    //         type: type,
    //         tags: [],
    //         components: {}
    //     };
    //
    //     opts.tags = _.cloneDeep(this.tags);
    //     opts.tags = _.without(opts.tags, type);
    //
    //     let cs = opts.components;
    //     let v = this.components;
    //     for (let i in v) {
    //         let c = v[i];
    //         cs[i] = c.toJSON();
    //         opts.tags = _.without(opts.tags, i, c.className);
    //         if (c.classAlias) opts.tags = _.without(opts.tags, c.classAlias);
    //         if (i === cs[i].className)
    //             delete cs[i].className;
    //     }
    //
    //     for (let i in et.tags) {
    //         opts.tags = _.without(opts.tags, et.tags[i]);
    //     }
    //     if (!opts.tags.length) delete opts.tags;
    //
    //     //去掉entityType中已经定义的相同部分
    //     this._clip(et, opts);
    //
    //     v = this.children;
    //     for (let i in v) {
    //         let e = v[i];
    //         if (!opts.children) opts.children = [];
    //         opts.children.push(e.toJSON());
    //     }
    //
    //     return opts;
    // }

  }, {
    key: 'em',
    get: function get() {
      return this._em;
    }
  }, {
    key: 'ecs',
    get: function get() {
      return this._ecs;
    }
  }, {
    key: 'components',
    get: function get() {
      return this._components;
    }
  }, {
    key: 'componentsByClass',
    get: function get() {
      return this._componentsByClass;
    }
  }]);

  return E;
}(_obj2.default);

E._className = 'entity';

exports.default = E;
module.exports = exports['default'];