'use strict'

// npm
const Lab = require('lab')
const Code = require('code')

// self
const HelpersMain = require('../../../templates/helpers/main')

const lab = exports.lab = Lab.script()

lab.experiment('HelpersMain()', () => {
  lab.test('it gets HelpersMain()', (done) => {
    Code.expect(HelpersMain()).to.match(/Available in main: pretty/i)
    done()
  })

  lab.test('it gets HelpersMain.pretty({ bob: 5 })', (done) => {
    Code.expect(HelpersMain.pretty({ bob: 5 })).to.match(/\{\n {2}"bob": 5\n\}/i)
    done()
  })
})
