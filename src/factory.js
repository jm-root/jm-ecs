import Obj from './obj'

/**
 * factory
 */
class F extends Obj {
  /**
   * create a factory
   * @param {EM} em - entity manager
   * @param {Object} opts
   */
  constructor (em, opts) {
    super(opts)
    this.em = em
  }

  create (opts = {}) {
    let em = this.em
    let e = em.e()
    if (!opts.components) return e
    if (opts.parent) {
      e.parent = opts.parent
    }

    for (let name of Object.keys(opts.components)) {
      let info = opts.components[name]
      let C = info.className || name
      info.className && (delete info.className)
      e.use(C, info, name)
    }
    this.emit('create', e)
    return e
  }
}

export default F
