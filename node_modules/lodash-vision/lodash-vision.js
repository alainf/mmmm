'use strict'

// npm
const lodash = require('lodash')

const partials = { }
const makeTpl = (t) => lodash.template(t, { imports: { partials: partials }, variable: 'data' })

module.exports = {
  compile: (template) => {
    const tpl = makeTpl(template)
    return (context) => tpl(context)
  },
  registerPartial: (name, template) => { partials[name] = makeTpl(template) }
}
