var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('../');
    require('./processorTest');
}

for(var i=0; i<2; i++)
(function(){
    console.info('******** jm.EntityManager *********');
    //console.info(jm.EntityManager.prototype);
    var em = jm.entityManager();
    var cfg = {
        processors: [
            'jm.ProcessorTest'
        ]
    };
    em.init(cfg);

    var types = {
        test: {
            tags: ['item', 'test'],
            components: {
                component: {
                    tags: ['c1', 'c2']
                }
            }
        }
    };
    em.addEntityTypes(types);

    var e = em.createEntity('test');
    console.info(JSON.stringify(e));

    em.processors['jm.ProcessorTest'].on('process', function(delta){
        console.info('event process');
    });
    em.update(0);

    {
        var v;
        v = em.getEntities('item, test1');
        console.info(JSON.stringify(v));
        v = em.getEntities('item test1');
        console.info(JSON.stringify(v));
        v = em.getEntities('item');
        console.info(JSON.stringify(v));
    }

    e.removeFromParent();
    console.info(JSON.stringify(e));

})();

