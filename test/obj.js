import chai from 'chai'
import Obj from '../src/obj'

let expect = chai.expect
let opts = {
  abc: 123
}
let o = new Obj(opts)
describe('Obj', function () {
  it('on', function (done) {
    o.on('test', function (v) {
      expect(v).to.be.equal('123')
      done()
    })
    o.emit('test', '123')
    o.off(test)
  })

  it('once', function (done) {
    o.once('test', function (v) {
      expect(v).to.be.equal('123')
      done()
    })
    o.emit('test', '123')
  })

  it('destroy', function (done) {
    o.on('destroy', function (v) {
      expect(o === v).to.be.ok
      done()
    })
    o.destroy()
  })
})
