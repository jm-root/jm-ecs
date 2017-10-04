import _ from 'lodash'
import Obj from './obj'
import E from './entity'
import F from './factory'
import log from 'jm-logger'

let logger = log.getLogger('jm-ecs')

/**
 * entity manager
 */
class EM extends Obj {
  /**
   * create an entity manager
   * @param {Object} ecs
   * @param {Object} opts
   */
  constructor (ecs, opts = {}) {
    super(opts)
    this._ecs = ecs
    this._entityTypes = {}
    this._pools = {}
    this._entities = {}
    this._entitiesByName = {}
    this._entitiesByTag = {}
    this.f = new F(this)
  }

  get ecs () {
    return this._ecs
  }

  get entityTypes () {
    return this._entityTypes
  }

  get pools () {
    return this._pools
  }

  get entities () {
    return this._entities
  }

  get entitiesByName () {
    return this._entitiesByName
  }

  get entitiesByTag () {
    return this._entitiesByTag
  }

  e (opts) {
    return new E(this, opts)
  }

  addEntityType (type, opts) {
    if (this._entityTypes[type]) {
      logger.warn('add entityType already exists for ' + type + ', replaced.')
    }

    this._entityTypes[type] = opts
  }

  addEntityTypes (opts) {
    for (let type in opts) {
      this.addEntityType(type, opts[type])
    }
  }

  entityType (type) {
    return this._entityTypes[type]
  }

  __createEntityFromPool (type, opts, parent) {
    if (!this._entityTypes[type].poolable) return null
    if (parent) return null
    if (opts && opts.parent) return null
    // 如果可池化, 先从池里取
    if (this._pools[type]) {
      let e = this._pools[type].shift()
      if (e) {
        e.emit('reuse', opts)
        this.addEntity(e)
        return e
      }
    }
    return null
  }

  createEntity (type, opts, parent) {
    let e = null
    e = this.__createEntityFromPool(type, opts, parent)
    if (e) return e

    let _opts = opts
    opts = {}
    opts = _.cloneDeep(this._entityTypes[type])
    if (_opts) {
      opts = _.merge(opts, _.cloneDeep(_opts))
    }

    if (parent) opts.parent = parent
    e = this.f.create(opts)
    if (!e) {
      return null
    }

    e.type = type
    e.addTag(type)
    opts.tags && (e.addTags(opts.tags))
    this.addEntity(e)

    this.createEntityChildren(e, opts)

    return e
  }

  createEntityChildren (e, opts) {
    // create Children
    for (let i in opts.children) {
      let info = opts.children[i]
      if (!info) continue
      let o = null
      let className = info.className || 'jm.Entity'
      if (className == 'jm.Entity') {
        let type = info.type
        o = this.createEntity(type, info, e)
      }
      if (!e.children) {
        e.children = []
      }
      e.children.push(o)
    }
  }

  addEntity (e, tag) {
    if (!e || !e.entityId) {
      return this
    }

    if (tag) {
      e.addTag(tag)
    }

    this._entities[e.entityId] = e
    if (e.name) {
      this._entitiesByName[e.name] = e
    }

    e.emit('add', this)
    this.emit('addEntity', e)

    return this
  }

  __removeEntityToPool (e) {
    let type = e.type
    if (!this._entityTypes[type].poolable) return false
    if (e.parent) return false
    // 如果可池化, 存到池里
    if (!this._pools[type]) this._pools[type] = []
    let pool = this._pools[type]
    e.emit('unuse')
    pool.push(e)
    return true
  }

  clearPool (type) {
    let pool = this._pools[type]
    if (!pool) return
    this._pools[type] = []
    pool.forEach(function (e) {
      e.destroy()
    })
  }

  clearPools () {
    for (let type in this._pools) {
      this.clearPool(type)
    }
  }

  removeEntity (entityId) {
    let e
    if (_.isObject(entityId)) {
      e = entityId
    } else {
      e = this._entities[entityId]
    }
    if (!e) {
      return this
    }

    this.removeEntityChildren(e)

    e.emit('remove', this)
    this.emit('removeEntity', e)
    delete this._entities[e.entityId]

    if (e.name) {
      delete this._entitiesByName[e.name]
    }

    if (this.__removeEntityToPool(e)) {
      return this
    } else {
      e.destroy()
    }

    return this
  }

  removeEntityChildren (e) {
    let v = e.children
    for (let i in v) {
      let _e = v[i]
      this.removeEntity(_e.entityId)
    }
  }

  //    getEntities('render')
  //    getEntities('render move tag1')  and
  //    getEntities('render, move, tag1')   or
  getEntities (selector) {
    let entities = this._entities
    if (!selector) return entities
    let v = {}
    // select entities by tags
    if (typeof selector === 'string') {
      let and = false, // flags for multiple
        or = false

      let rlist = /\s*,\s*/
      let rspace = /\s+/
      let del
      // multiple components OR
      if (selector.indexOf(',') !== -1) {
        or = true
        del = rlist
      } else if (selector.indexOf(' ') !== -1) {
        and = true
        del = rspace
      }
      if (!and && !or) {
        return this._entitiesByTag[selector]
      }
      let tags = selector.split(del)
      let e
      for (let entityId in entities) {
        e = entities[entityId]
        if (and) {
          if (!e.hasTagAll(tags)) continue
        } else if (or) {
          if (!e.hasTagAny(tags)) continue
        }
        v[entityId] = e
      }
    }

    return v
  }

  getEntity (selector) {
    let v = this.getEntities(selector)
    for (let i in v) {
      return v[i]
    }
    return null
  }

  update (opts) {
    this.emit('update', opts)
  }
}

export default EM
