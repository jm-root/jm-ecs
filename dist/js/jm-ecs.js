var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    jm.Component = jm.TagObject.extend({
        _className: 'component',
        _singleton: true,
        _nameReadOnly: false,

        properties: {
            singleton: { get: 'getSignleton' },
            entity: {get: 'getEntity'},
            name: { get: 'getName', set: 'setName' }
        },

        ctor: function (entity, opts) {
            this._super();
            this._entity = entity;
            this.active = true;
            if(opts) this.attr(opts);
        },

        destroy: function() {
        },

        /**
         * on added to an entity
         * @param e
         */
        onAdd: function(e) {
        },

        /**
         * on removed from an entity
         * @param e
         */
        onRemove: function(e) {
        },

        getName: function(){
            return this._name || this.classAlias || this.className;
        },

        setName: function(name){
            if(this._nameReadOnly) return;
            this._name = name;
        },

        getSignleton : function () {
            return this._singleton;
        },

        getEntity : function () {
            return this._entity;
        },

        toJSON: function() {
            return {
                className: this.classAlias || this.className
            };
        }

    });

    jm.root.registries.components = {
        'component': jm.Component
    };

    jm.Component.extend = function(opts){
        var Class = jm.Class.extend.call(this, opts);
        Class.extend = jm.Component.extend;
        jm.root.registries.components[Class.prototype._className] = Class;
        return Class;
    };

})();
var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    var _ = require('lodash');
    jm = require('jm-core');
}

(function(){
    var guid = 1;

    function isEmptyObject(e) {
        var t;
        for (t in e)
            return false;
        return true;
    }

    jm.Entity = jm.TagObject.extend({
        _className: 'entity',

        ctor: function(entityManager){
            this._super();

            this.entityManager = entityManager;
            this._components = {};
            this._componentsByClass = {};
            this._componentGUID = 1;

            this.active = true;
            this.entityId = guid++;

            Object.defineProperty(this, "components", { value: this._components, writable: false });
            Object.defineProperty(this, "componentsByClass", { value: this._componentsByClass, writable: false });

            this.on('addTag', function(tag){
                entityManager._entitiesByTag[tag] = entityManager._entitiesByTag[tag] || {};
                entityManager._entitiesByTag[tag][this.entityId] = this;
            });
            this.on('removeTag', function(tag){
                var o = entityManager._entitiesByTag[tag];
                if(!o) return;
                delete o[this.entityId];
                if(isEmptyObject(o))
                    delete entityManager._entitiesByTag[tag];
            });
        },

        destroy: function(){
            this.emit('destroy', this);
            this.removeAllComponents();
            this.removeAllTags();
        },

        removeChild: function(e){
            this.entityManager.removeEntity(e.entityId);
            this.children = _.without(this.children, e);
            e.destroy();
        },

        removeFromParent: function(){
            if(this.parent){
                this.parent.removeChild(this);
            }else{
                this.entityManager.removeEntity(this.entityId);
            }
        },

        addComponent: function (c) {
            var components = this._components;
            var componentsByClass = this._componentsByClass;
            var name = c.name;
            var cClassName = c.className;

            var bUsedName = (name in components );
            if(bUsedName){
                if(c.singleton) {
                    if (bUsedName) throw "componen already exists with the name: " + name;
                }
                name = cClassName + this._componentGUID++;
                c.name = name;
            }

            if(cClassName in componentsByClass ){
            }else{
                componentsByClass[cClassName] = {};
            }
            var vByClass = componentsByClass[cClassName];

            components[name] = c;
            vByClass[name] = c;
            this[name] = c;
            this.addTag(cClassName);
            if(c.classAlias) this.addTag(c.classAlias);

            c.onAdd(this);
            c.emit('add', this);
            this.emit('addComponent', c);

            return this;
        },

        removeComponent: function (c_or_name) {
            var components = this._components;
            var componentsByClass = this._componentsByClass;
            var c = c_or_name;
            if(typeof c == 'string'){
                c = components[c];
            }
            if(!c) return this;
            var name = c.name;
            var cClassName = c.className;
            var v = componentsByClass[cClassName];
            delete components[name];
            delete v[name];
            delete this[name];
            this.removeTag(cClassName);

            c.onRemove(this);
            c.emit('remove', this);
            this.emit('removeComponent', c);
            c.destroy();
            return this;
        },

        removeComponents: function (className) {
            var v = this.getComponents(className);
            for(i in v){
                this.removeComponent(i);
            }
            delete this._componentsByClass[className];
            this.emit('removeComponents', className);
            return this;
        },

        removeAllComponents: function () {
            var v = this._components;
            for(i in v){
                this.removeComponent(i);
            }
            this.emit('removeAllComponents');
            return this;
        },

        getComponent: function(name) {
            return this._components[name];
        },

        getComponents: function(className) {
            return this._componentsByClass[className];
        },

        /**
         * 去掉entityType中已经定义的相同部分
         */
        _clip: function (origin, target) {
            if (!origin) {
                return;
            }

            var obj = target;

            for (var key in target) {
                var t = target[key];
                var o = origin[key];
                if(_.isObject(t)){
                    if(o){
                        this._clip(o, t);
                    }
                    if(_.isEmpty(t)){
                        delete target[key];
                    }
                    continue;
                }

                if(t===o){
                    delete target[key];
                }
            }
        },

        toJSON: function(){
            var em = this.entityManager;
            var type = this.type;
            var et = em.entityType(type);

            var opts = {
                type: type,
                tags: [],
                components: {}
            };

            opts.tags = _.cloneDeep(this.tags);
            opts.tags = _.without(opts.tags, type);

            var cs = opts.components;
            var v = this.components;
            for(i in v){
                var c = v[i];
                cs[i] = c.toJSON();
                opts.tags = _.without(opts.tags, i, c.className);
                if(c.classAlias) opts.tags= _.without(opts.tags, c.classAlias);
                if(i === cs[i].className)
                    delete cs[i].className;
            }

            for(i in et.tags){
                opts.tags = _.without(opts.tags, et.tags[i]);
            }
            if(!opts.tags.length) delete opts.tags;

            //去掉entityType中已经定义的相同部分
            this._clip(et, opts);

            v = this.children;
            for(i in v){
                var e = v[i];
                if(!opts.children) opts.children = [];
                opts.children.push(e.toJSON());
            }

            return opts;
        }

    });
})();
var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    var _ = require('lodash');
    jm = require('jm-core');
}

(function(){
    var __parseConfigInfo = function(opts, key) {
        var bArray = _.isArray(opts);
        var className, name;
        if (bArray) {
            className = opts[key];
            name = null;
        } else {
            className = key;
            name = opts[key];
        }

        return {className: className, name: name};
    };

    jm.EntityManager =  jm.EventEmitter.extend({
        _className: 'entityManager',

        ctor:function (opts) {
            this._super();

            this._components = {};
            this._processors = {};
            this._factories = {};
            this._entityTypes = {};
            this._pools = {};

            this._entities = {};
            this._entitiesByName = {};
            this._entitiesByTag = {};

            Object.defineProperty(this, "components", { value: this._components, writable: false });
            Object.defineProperty(this, "processors", { value: this._processors, writable: false });
            Object.defineProperty(this, "factories", { value: this._factories, writable: false });
            Object.defineProperty(this, "entityTypes", { value: this._entityTypes, writable: false });
            Object.defineProperty(this, "pools", { value: this._pools, writable: false });

            Object.defineProperty(this, "entities", { value: this._entities, writable: false });
            Object.defineProperty(this, "entitiesByName", { value: this._entitiesByName, writable: false });
            Object.defineProperty(this, "entitiesByTag", { value: this._entitiesByTag, writable: false });

            var v = jm.root.registries.factories;
            for(var key in v){
                var o = new v[key](this);
                this.addFactory(o, key);
            }

            this.init(opts)
        },

        init: function(opts){
            if(!opts) return;
            this.addComponents(opts.components);
            this.addProcessors(opts.processors);
            this.addFactories(opts.factories);
        },

        addComponents: function(opts) {
            var bArray = _.isArray(opts);
            for(var key in opts){
                var info = __parseConfigInfo(opts, key);
                var C = eval(info.className);
                this.addComponent(C, info.className, true);
                this.addComponent(C, info.name);
            }
            return this;
        },

        addProcessors: function(opts) {
            for(var key in opts){
                var info = __parseConfigInfo(opts, key);
                var o = eval('new ' + info.className + '(this)');
                if(info.name){
                    this.addProcessor(o, info.name);
                }else{
                    this.addProcessor(o, info.className);
                }
            }
            return this;
        },

        addFactories: function(opts) {
            for(var key in opts){
                var info = __parseConfigInfo(opts, key);
                var o = eval('new ' + info.className + '(this)');
                this.addFactory(o, info.className);
                this.addFactory(o, info.name);
            }
            return this;
        },

        addComponent: function (C, name, notAlias) {
            if (!C) return this;
            if (!name) {
                name = C.prototype._className;
            }else{
                if(!notAlias){
                    if(name!=C.prototype._className){
                        C.prototype.classAlias = name;
                    }
                }
            }
            if(this._components[name]){
                this.emit('warn','add Compoent already exists for ' + name + ', replaced.');
            }
            this._components[name] = C;
            this.emit('addComponent', name);
            return this;
        },

        removeComponent: function (name) {
            var components = this._components;
            var o = components[name];
            if(o){
                this.emit('removeComponent', name);
            }
            delete components[name];
            return this;
        },

        component: function (name) {
            return this._components[name];
        },

        addEntityType: function(type, opts) {
            if(this._entityTypes[type]){
                this.emit('warn','add entityType already exists for ' + type + ', replaced.');
            }

            this._entityTypes[type] = opts;
        },

        addEntityTypes: function(opts) {
            for(var type in opts){
                this.addEntityType(type, opts[type]);
            }
        },

        entityType: function(type) {
            return this._entityTypes[type];
        },

        addFactory: function (f, name) {
            if(!f) return this;
            name = name || f.name || f.className;

            if(this._factories[name]){
                this.emit('warn','add factory already exists for ' + name + ', replaced.');
            }

            this._factories[name] = f;
            if(f.entityManager!=this)
                f.entityManager = this;
            this.emit('addFactory', f);

            return this;
        },

        removeFactory: function (name) {
            var factories = this._factories;
            var f = factories[name];
            if(f){
                this.emit('removeFactory', f);
                delete factories[name];
                f.destroy();
            }
            return this;
        },

        factory: function (name) {
            return this._factories[name];
        },

        addProcessor: function (p, name) {
            if(!p) return this;
            if(!name)
                name = p.name || p.className;

            if(this._processors[name]){
                this.emit('warn','add processor already exists for ' + name + ', replaced.');
            }

            this._processors[name] = p;
            if(p.entityManager!=this)
                p.entityManager = this;
            this.emit('addProcessor', p);

            return this;
        },

        removeProcessor: function (name) {
            var processors = this._processors;
            var p = processors[name];

            if(p){
                this.emit('removeProcessor', p);
                delete processors[name];
                p.destroy();
            }

            return this;
        },

        processor: function (name) {
            return this._processors[name];
        },

        __createEntityFromPool: function(type, opts, parent){
            if(!this._entityTypes[type].poolable) return null;
            if(parent) return null;
            if(opts && opts.parent) return null;
            //如果可池化, 先从池里取
            if(this._pools[type]){
                var e = this._pools[type].shift();
                if(e){
                    e.emit('reuse', opts);
                    this.addEntity(e);
                    return e;
                }
            }
            return null;
        },

        createEntity: function(type, opts, parent){
            var e = null;
            e = this.__createEntityFromPool(type, opts, parent);
            if(e) return e;

            var _opts = opts;
            opts = {};
            opts = _.cloneDeep(this._entityTypes[type]);
            if(_opts) {
                opts = _.merge(opts, _.cloneDeep(_opts));
            }

            var name = opts.factory || 'factory';
            var f = this._factories[name];
            if(!f) return null;
            if(parent) opts.parent = parent;
            e = f.create(opts);
            if (!e) {
                return null;
            }

            e.type = type;
            e.addTag(type);
            e.addTags(opts.tags);
            this.addEntity(e);

            this.createEntityChildren(e, opts);

            return e;
        },

        createEntityChildren: function(e, opts){
            //create Children
            for(var i in opts.children){
                var info = opts.children[i];
                if(!info) continue;
                var o = null;
                var className = info.className || 'jm.Entity';
                if(className == 'jm.Entity'){
                    var type = info.type;
                    o = this.createEntity(type, info, e);
                }
                if(!e.children){
                    e.children = [];
                }
                e.children.push(o);
            }
        },

        addEntity: function(e, tag){
            if (!e || !e.entityId) {
                return this;
            }

            if(tag){
                e.addTag(tag);
            }

            this._entities[e.entityId] = e;
            if(e.name){
                this._entitiesByName[e.name] = e;
            }

            e.emit('add', this);
            this.emit('addEntity', e);

            return this;
        },

        __removeEntityToPool: function(e){
            var type = e.type;
            if(!this._entityTypes[type].poolable) return false;
            if(e.parent) return false;
            //如果可池化, 存到池里
            if(!this._pools[type]) this._pools[type] = [];
            var pool = this._pools[type];
            e.emit('unuse');
            pool.push(e);
            return true;
        },

        clearPool: function(type) {
            var pool = this._pools[type];
            if(!pool) return;
            this._pools[type] = [];
            pool.forEach(function(e){
                e.destroy();
            });
        },

        clearPools: function() {
            for(var type in this._pools) {
                this.clearPool(type);
            }
        },

        removeEntity: function(entityId) {
            var e;
            if(_.isObject(entityId)){
                e = entityId;
            }else{
                e = this._entities[entityId];
            }
            if (!e) {
                return this;
            }

            this.removeEntityChildren(e);

            e.emit('remove', this);
            this.emit('removeEntity', e);
            delete this._entities[e.entityId];

            if(e.name){
                delete this._entitiesByName[e.name];
            }

            if(this.__removeEntityToPool(e)){
                return this;
            }else{
                e.destroy();
            }

            return this;
        },

        removeEntityChildren: function(e){
            var v = e.children;
            for(var i in v){
                var _e = v[i];
                this.removeEntity(_e.entityId);
            }
        },

//    getEntities('render')
//    getEntities('render move tag1')  and
//    getEntities('render, move, tag1')   or
        getEntities: function(selector) {
            var entities = this._entities;
            if(!selector) return entities;
            var v = {};
            //select entities by tags
            if (typeof selector === 'string') {
                var and = false, //flags for multiple
                    or = false;

                var rlist = /\s*,\s*/;
                var rspace = /\s+/;
                var del;
                //multiple components OR
                if (selector.indexOf(',') !== -1) {
                    or = true;
                    del = rlist;
                } else if (selector.indexOf(' ') !== -1) {
                    and = true;
                    del = rspace;
                }
                if(!and && !or){
                    return this._entitiesByTag[selector];
                }
                var tags = selector.split(del);
                var e;
                for (var entityId in entities) {
                    e = entities[entityId];
                    if(and) {
                        if (!e.hasTagAll(tags)) continue;
                    }else if(or) {
                        if (!e.hasTagAny(tags)) continue;
                    }
                    v[entityId] = e;
                }
            }

            return v;
        },

        getEntity: function(selector) {
            var v = this.getEntities(selector);
            for(var i in v){
                return v[i];
            }
            return null;
        },

        update: function(delta) {
            this.emit('update', delta);
            var processors = this._processors;
            for (var name in processors) {
                var p = processors[name];
                p.process(delta);
            }
        }

    });

    jm.entityManager = function(opts) { return new jm.EntityManager(opts); }
})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    jm.Factory = jm.EventEmitter.extend({
        _className : 'factory',

        ctor: function (entityManager, opts) {
            this._super(opts);
            this.entityManager = entityManager;
        },

        destory : function () {
            this.emit('destroy', this);
            this._super();
        },

        create: function(opts){
            var e = new jm.Entity(this.entityManager);
            if(!opts || !opts.components) return e;
            if(opts.parent){
                e.parent = opts.parent;
            }

            var c;
            var em = this.entityManager;
            for(var name in opts.components){
                var info = opts.components[name];
                var className = name;
                if(info.className)
                    className = info.className;
                var C = em.component(className);
                if(!C){
                    C = jm.root.registries.components[className];
                    if(C){
                        em.addComponent(C, className);
                    }else{
                        C = eval(className);
                        if(C){
                            C = jm.root.registries.components[C.prototype._className];
                        }
                        if(C){
                            em.addComponent(C, className, true);
                        }else{
                            em.emit('warn', 'can not find component ' + className + ', ignored');
                            continue;
                        }
                    }
                }
                c = new C(e, info);
                if(info.className)
                    c.name = name;
                e.addComponent(c);
            }
            this.emit('create', e);
            return e;
        }

    });

    jm.root.registries.factories = {
        'factory': jm.Factory
    };

    jm.Factory.extend = function(opts){
        var Class = jm.Class.extend.call(this, opts);
        Class.extend = jm.Factory.extend;
        jm.root.registries.factories[Class.prototype._className] = Class;
        return Class;
    };
})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    jm.Processor = jm.EventEmitter.extend({
        _className : 'processor',

        ctor : function (entityManager, opts) {
            this._super();

            this.active = true;
            this.entityManager = entityManager;
        },

        destory : function () {
            this.emit('destroy', this);
            this._super();
        },

        process : function(delta) {
            if(!this.active) return;
            if(!this.update) return;
            this.emit('process', delta);
            var entities = this.entityManager.entities;
            for (var entityId in entities) {
                var e = entities[entityId];
                this.update(e, delta);
            }
        }

    });

    jm.root.registries.processors = {};

    jm.Processor.extend = function(opts){
        var Class = jm.Class.extend.call(this, opts);
        Class.extend = jm.Processor.extend;
        jm.root.registries.processors[Class.prototype._className] = Class;
        return Class;
    };

})();