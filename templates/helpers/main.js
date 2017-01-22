'use strict'

const helpers = {
  pretty: (context) => JSON.stringify(context, null, '  ')
}

module.exports = () => 'Available in main: ' + Object.keys(helpers).join(', ')

for (let r in helpers) { module.exports[r] = helpers[r] }
