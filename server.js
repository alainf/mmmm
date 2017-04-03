'use strict'

// self
const Config = require('./config')
const Composer = require('./index')
const ddocManager = require('./ddoc/index')

// Assemble the application and start the server
Composer((err, server) => {
  if (err) { throw err }
  server.start((err) => {
    if (err) { throw err }
    console.log(new Date())
    console.log(`\nStarted the web server on ${server.info.host}:${server.info.port}`)
  })
})

// Update the CouchDB design document when it changes
ddocManager(Config, function (err, resp) {
  if (err) { console.log('Push error:', err) }
  console.log('Pushing:', resp)
})
