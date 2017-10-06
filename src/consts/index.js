let BaseErrCode = 800

export default {
  Err: {
    InvalidComponent: {
      err: BaseErrCode++,
      msg: 'invalid component ${name}'
    },
    SingletonComponent: {
      err: BaseErrCode++,
      msg: 'singleton component ${name} already exists'
    }
  }
}
