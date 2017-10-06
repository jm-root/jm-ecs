import chai from 'chai'
import error from 'jm-err'
import consts from '../src/consts'
let Err = consts.Err
let expect = chai.expect

describe('Err', function () {
  it('Err', function () {
    let E = Err.InvalidComponent
    expect(E).to.be.an('object')
  })

  it('err', function () {
    let e = error.err(Err.InvalidComponent, { name: 'abc'})
    expect(e.message).to.be.equal('invalid component abc')
  })
})
