import event from 'jm-event'

/**
 * object
 */
class Obj extends event.EventEmitter {
  /**
   * create an object
   * @param {Object} opts
   */
  constructor (opts) {
    super()

    if (opts) {
      for (let key of Object.keys(opts)) {
        this[key] = opts[key]
      }
    }
  }

  /**
   * destroy
   */
  destroy () {
    this.emit('destroy', this)
  }
}

export default Obj
