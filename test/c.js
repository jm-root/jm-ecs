import chai from 'chai'
import C from '../src/component'

let expect = chai.expect
let e = {}
let opts = {
  abc: 123
}
let o = new C(e, opts)
console.log('%j', C)
console.log('%j', o)

describe('C', function () {
  it('name', function (done) {
    expect(o.name === 'component').to.be.ok
    done()
  })

  it('toJSON', function (done) {
    expect(o.toJSON()).to.be.ok
    done()
  })

  it('destroy', function (done) {
    o.on('destroy', function (v) {
      expect(o === v).to.be.ok
      done()
    })
    o.destroy()
  })
})
