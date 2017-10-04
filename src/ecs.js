import error from 'jm-err'
import log from 'jm-logger'
import Obj from './obj'
import C from './component'
import EM from './em'

let logger = log.getLogger('jm-ecs')

/**
 * using component
 * @param ecs
 * @param C
 * @param name
 * @return {_useC}
 * @private
 */
function _useC (ecs, C, name) {
  let components = ecs._components
  if (components[name]) {
    logger.warn('use Compoent already exists for ' + name + ', replaced.')
  }
  components[name] = C
  ecs.emit('use', name, C)
}

function _use (ecs, C, name) {
  if (!C) throw error.err(error.Err.FA_PARAMS)

  name || (name = C.class || C.name)
  if (!name) throw error.err(error.Err.FA_PARAMS)

  switch (C.type) {
    case 'C':
      return _useC(ecs, C, name)
      break
    default:
  }
}

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
    _use(this, C, name)
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

export default ECS
