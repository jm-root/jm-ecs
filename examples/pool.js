if (typeof module !== 'undefined' && module.exports) {
  require('../')
}
var ecs = jm.ecs()
var em = ecs.em()

var types = {
  test: {
    poolable: true,
    components: {
      component: {}
    }
  }
}
em.addEntityTypes(types)

console.info('create entity')
var e = em.createEntity('test')
e.on('unuse', function () {
  console.info('unuse entityId: %j', e.entityId)
})
e.on('reuse', function () {
  console.info('reuse entityId: %j', e.entityId)
})
console.info('created entityId: %j', e.entityId)
console.info('remove entity')
e.removeFromParent()
console.info('entities: %j pools[%s]: %j', Object.keys(em.entities).length, e.type, em.pools[e.type].length)
console.info('create entity')
e = em.createEntity('test')
console.info('entities: %j pools[%s]: %j', Object.keys(em.entities).length, e.type, em.pools[e.type].length)
console.info('created entityId: %j', e.entityId)

console.info('remove entity')
e.removeFromParent()
console.info('entities: %j pools[%s]: %j', Object.keys(em.entities).length, e.type, em.pools[e.type].length)
console.info('clear pool')
// em.clearPool(e.type);
em.clearPools()
console.info('entities: %j pools[%s]: %j', Object.keys(em.entities).length, e.type, em.pools[e.type].length)
console.info('create entity')
e = em.createEntity('test')
console.info('entities: %j pools[%s]: %j', Object.keys(em.entities).length, e.type, em.pools[e.type].length)
console.info('created entityId: %j', e.entityId)
