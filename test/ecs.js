import chai from 'chai'
let expect = chai.expect
import util from 'jm-utils'
import log from 'jm-logger'

import ECS from '../src'
import C from '../src/component'

let ecs = new ECS()
  .uses([{class: C, name: 'component2'}])
  .uses([{class: C, name: 'component1'}])
  .unuse('component1')

let em = ecs.em()

// 手动创建实体
let e = em.e()
e.use('component', {value: 1})
e.use('component', {value: 2}, 'c2')
e.use('component2', {value: 3})
e.unuse('c2')
em.addEntity(e, 'test2')

// 通过entityType创建实体
em.addEntityType('test', {
  components: {
    component: {},
    c1: {
      className: 'component2'
    }
  }
})
let e2 = em.createEntity('test')

let logger = log.logger
let utils = util.utils

logger.info('ecs: %j', ecs)
logger.info('em: %j', em)
logger.info('e: %j', e)
logger.info('e2: %j', e2)
em.removeEntitiesByType('test')
logger.info('em: %j', em)

describe('ecs', function () {
  it('ecs', function () {
    expect(ECS).to.be.a('function')
    expect(ecs).to.be.an('object')
  })

  it('em', function (done) {
    done()
  })
})
