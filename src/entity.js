import _ from 'lodash'
import tag from 'jm-tag'
import error from 'jm-err'
import Obj from './obj'
import consts from './consts'

let Err = consts.Err

let guid = 1

function isEmptyObject (e) {
  let t
  for (let t in e) {
    return false
  }
  return true
}

class E extends Obj {
  constructor (em, opts) {
    super(opts)
    tag.enableTag(this)

    this._em = em
    this._ecs = em.ecs
    this._components = {}
    this._componentsByClass = {}
    this._componentGUID = 1

    this.active = true
    this.entityId = guid++

    this.on('addTag', (tag) => {
      em._entitiesByTag[tag] || (em._entitiesByTag[tag] = {})
      em._entitiesByTag[tag][this.entityId] = this
    })

    this.on('removeTag', (tag) => {
      let o = em._entitiesByTag[tag]
      if (!o) return
      delete o[this.entityId]
      if (isEmptyObject(o)) {
        delete em._entitiesByTag[tag]
      }
    })
  }

  destroy () {
    super.destroy()
    this.removeAllComponents()
    this.removeAllTags()
  }

  get em () {
    return this._em
  }

  get ecs () {
    return this._ecs
  }

  get components () {
    return this._components
  }

  get componentsByClass () {
    return this._componentsByClass
  }

  use (C, opts, name) {
    let ecs = this.ecs
    if (typeof C === 'string') {
      name || (name = C)
      C = ecs.component(C)
      if (!C) throw error.err(Err.InvalidComponent, {name: C})
    }
    if (!C) throw error.err(error.Err.FA_PARAMS)

    let c = new C(this, opts)

    let components = this._components
    let componentsByClass = this._componentsByClass
    name || (name = c.className)
    let cClassName = c.className

    let bUsedName = (name in components)
    if (bUsedName) {
      if (C.singleton) throw error.err(Err.SingletonComponent, {name: name})
      name = cClassName + this._componentGUID++
    }

    componentsByClass[cClassName] || (componentsByClass[cClassName] = {})
    let vByClass = componentsByClass[cClassName]

    components[name] = c
    vByClass[name] = c
    this[name] = c
    this.addTag(cClassName)
    if (C.alias) this.addTag(C.alias)

    c.emit('use', this)
    this.emit('use', c)

    return this
  }

  unuse (C_or_name) {
    let components = this._components
    let componentsByClass = this._componentsByClass
    let c = C_or_name
    let name
    if (typeof c === 'string') {
      name = c
      c = components[c]
    }
    if (!c) return this

    name || (name = c.name)
    let cClassName = c.className
    let v = componentsByClass[cClassName]
    delete components[name]
    delete v[name]
    delete this[name]
    if(!v.length) this.removeTag(cClassName)

    c.emit('unuse', this)
    this.emit('unuse', c)
    c.destroy()
    return this
  }

  removeChild (e) {
    this.em.removeEntity(e.entityId)
    this.children = _.without(this.children, e)
    e.destroy()
  }

  removeFromParent () {
    if (this.parent) {
      this.parent.removeChild(this)
    } else {
      this.em.removeEntity(this.entityId)
    }
  }

  removeComponents (className) {
    let v = this.getComponents(className)
    for (let i in v) {
      this.unuse(i)
    }
    delete this._componentsByClass[className]
    this.emit('removeComponents', className)
    return this
  }

  removeAllComponents () {
    let v = this._components
    for (let i in v) {
      this.unuse(i)
    }
    this.emit('removeAllComponents')
    return this
  }

  getComponent (name) {
    return this._components[name]
  }

  getComponents (className) {
    return this._componentsByClass[className]
  }

  /**
   * 去掉entityType中已经定义的相同部分
   */
  _clip (origin, target) {
    if (!origin) {
      return
    }

    let obj = target

    for (let key in target) {
      let t = target[key]
      let o = origin[key]
      if (_.isObject(t)) {
        if (o) {
          this._clip(o, t)
        }
        if (_.isEmpty(t)) {
          delete target[key]
        }
        continue
      }

      if (t === o) {
        delete target[key]
      }
    }
  }

  toJSON () {
    let type = this.type

    let opts = {
      type: type,
      tags: [],
      components: {}
    }

    opts.tags = _.cloneDeep(this.tags);
    opts.tags = _.without(opts.tags, type);

    let cs = opts.components;
    let v = this.components;
    for (let i in v) {
      let c = v[i];
      cs[i] = c.toJSON();
      opts.tags = _.without(opts.tags, i, c.className);
      if (i === cs[i].className)
        delete cs[i].className
    }

    let et = this.em.entityType(type)

    if (et) {
      for (let i in et.tags) {
        opts.tags = _.without(opts.tags, et.tags[i]);
      }
      // 去掉entityType中已经定义的相同部分
      this._clip(et, opts);
    }
    if (opts.tags && !opts.tags.length) delete opts.tags;
    v = this.children;
    for (let i in v) {
      let e = v[i];
      if (!opts.children) opts.children = [];
      opts.children.push(e.toJSON());
    }

    return opts;
  }
}

export default E
