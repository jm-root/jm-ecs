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

  get singleton () {
    return C.singleton
  }

  get name () {
    return this._name || C.alias || C.class
  }

  set name (v) {
    if (C.nameReadOnly) return
    this._name = v
  }

  /**
     * on added to an entity
     * @param e
     */
  onUse (e) {
  }

  /**
     * on removed from an entity
     * @param e
     */
  onUnuse (e) {
  }

  toJSON () {
    return {
      class: C.alias || C.class
    }
  };
}

C.type = 'C'
C.class = 'component'
C.singleton = false
C.nameReadOnly = false

export default C
