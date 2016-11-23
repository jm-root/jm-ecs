var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    var _ = require('lodash');
    jm = require('jm-core');
}

(function(){
    if(jm.Entity) return;
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
