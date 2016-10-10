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