import ECS from './ecs'

if (typeof global !== 'undefined' && global) {
  if (global.jm) {
    global.jm.ECS = ECS
    global.jm.ecs = function (opts) {
      return new ECS(opts)
    }
  }
}

export default ECS
