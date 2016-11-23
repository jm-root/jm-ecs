var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    if(jm.Component) return;
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
