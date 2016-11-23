var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    var _ = require('lodash');
    jm = require('jm-core');
}

(function(){
    if(jm.EntityManager) return;
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
