var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('../');
}

(function(){
    var logger = jm.logger;
    logger.info('******** jm.EntityManager *********');
    //logger.info(jm.EntityManager.prototype);
    var em = jm.entityManager();
    var cfg = {
    };
    em.init(cfg);

    var types = {
        test: {
            poolable: true,
            components: {
                component: {
                }
            }
        }
    };
    em.addEntityTypes(types);

    logger.info('create entity');
    var e = em.createEntity('test');
    e.on('unuse', function(){logger.info('unuse entityId: %j', e.entityId);});
    e.on('reuse', function(){logger.info('reuse entityId: %j', e.entityId);});
    logger.info('created entityId: %j', e.entityId);
    logger.info('remove entity');
    e.removeFromParent();
    logger.info('entities: %j pools[%s]: %j', Object.keys(em.entities).length, e.type, em.pools[e.type].length);
    logger.info('create entity');
    e = em.createEntity('test');
    logger.info('entities: %j pools[%s]: %j', Object.keys(em.entities).length, e.type, em.pools[e.type].length);
    logger.info('created entityId: %j', e.entityId);

    logger.info('remove entity');
    e.removeFromParent();
    logger.info('entities: %j pools[%s]: %j', Object.keys(em.entities).length, e.type, em.pools[e.type].length);
    logger.info('clear pool');
    //em.clearPool(e.type);
    em.clearPools();
    logger.info('entities: %j pools[%s]: %j', Object.keys(em.entities).length, e.type, em.pools[e.type].length);
    logger.info('create entity');
    e = em.createEntity('test');
    logger.info('entities: %j pools[%s]: %j', Object.keys(em.entities).length, e.type, em.pools[e.type].length);
    logger.info('created entityId: %j', e.entityId);

})();

