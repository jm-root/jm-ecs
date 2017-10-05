import Obj from './obj'

/**
 * component
 */
class C extends Obj {
  /**
   * create a component
   * @param {E} e entity
   * @param {Object} opts
   */
  constructor (e, opts) {
    super(opts)
    this._entity = e
    this.active = true
  }

  get entity () {
    return this._entity
  }

  get className () {
    return C.className || C.name
  }

  get singleton () {
    return C.singleton
  }

  get name () {
    return this._name || this.className
  }

  set name (v) {
    if (C.nameReadOnly) return
    this._name = v
  }

  toJSON () {
    return {
      className: this.className
    }
  }
}

C.className = 'component'
C.singleton = false
C.nameReadOnly = false

export default C
