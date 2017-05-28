'use strict'

const Lab = require('lab')
const Code = require('code')
const Composer = require('../index')

const lab = exports.lab = Lab.script()

let cntA = 0
let cntB = 0

lab.experiment('App', () => {
  lab.test('it composes a server', (done) => {
    console.log('cntA', ++cntA)
    Composer((err, composedServer) => {
      console.log('cntB', ++cntB)
      Code.expect(composedServer).to.be.an.object()
      done(err)
    })
  })
})
