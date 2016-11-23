var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    if(jm.Factory) return;
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
