'use strict'

require('dotenv-safe').load()

const Confidence = require('confidence')
const criteria = { env: process.env.NODE_ENV }

const defTrue = {
  $filter: 'env',
  prod: false,
  $default: true
}

const defFalse = {
  $filter: 'env',
  prod: true,
  $default: false
}

const config = {
  $meta: 'This file configures the plot device.',
  projectName: 'hapi-demo',
  app: { siteTitle: process.env.SITETITLE },
  db: {
    url: process.env.DBURL,
    name: process.env.DBNAME,
    admin: process.env.DBADMIN,
    password: process.env.DBPASSWORD
  },
  i18n: {
    autoReload: defTrue,
    updateFiles: defTrue,
    locales: ['fr', 'en']
  },
  cookie: {
    password: 'password-should-be-32-characters',
    secure: defFalse
  },
  cache: { web: defFalse },
  port: {
    web: {
      $filter: 'env',
      test: 9090,
      $default: 8090
    }
  }
}

const store = new Confidence.Store(config)
exports.get = (key) => store.get(key, criteria)
exports.meta = (key) => store.meta(key, criteria)
