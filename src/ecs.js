import error from 'jm-err'
import log from 'jm-logger'
import Obj from './obj'
import C from './component'
import EM from './em'

let logger = log.getLogger('jm-ecs')

/**
 * entity component system
 */
class ECS extends Obj {
  /**
   * create an entity component system
   * @param opts
   */
  constructor (opts) {
    super(opts)
    this._components = {}
    this.use(C)
  }

  /**
   * use module
   * @param {Object} C
   * @param name
   * @return {ECS}
   */
  use (C, name) {
    if (!C) throw error.err(error.Err.FA_PARAMS)
    name || (name = C.class || C.name)
    if (!name) throw error.err(error.Err.FA_PARAMS)
    let components = this._components
    if (components[name]) {
      logger.warn('use Compoent already exists for ' + name + ', replaced.')
    }
    components[name] = C
    this.emit('use', name, C)
    return this
  }

  /**
   * use modules
   * uses({class:C, name: 'components'})
   * uses(['Component1', 'Component2', {name: 'components3', class:'C'}...'Factory1', 'Factory2'])
   * uses({class: C, name: 'component'}, 'Component2'...'Factory1', 'Factory2')
   * @param opts
   * @return {ECS}
   */
  uses (...args) {
    for (let opts of args) {
      if (Array.isArray(opts)) {
        this.uses(...opts)
      } else if (typeof opts === 'object') {
        this.use(opts.class, opts.name)
      } else {
        this.use(opts)
      }
    }
    return this
  }

  unuse (name) {
    let components = this._components
    let C = components[name]
    if (C) {
      ecs.emit('unuse', name, C)
    }
    delete components[name]
    return this
  }

  component (name) {
    return this._components[name]
  }

  get components () {
    return this._components
  }

  em (opts) {
    return new EM(this, opts)
  }
}

ECS.C = C

export default ECS
