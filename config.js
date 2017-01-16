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
  app: {
    siteTitle: process.env.SITETITLE,
    logoSrc: '/img/phdadmin_logo.png',
    logoAlt: 'PhD Administration',
    logoTip: 'Retour vers Accueil',
    logoHref: '/fr/accueil',
    username: 'Alain Farmer',
    usertype: 'membre'
  },
  db: {
    url: process.env.DBURL,
    name: process.env.DBNAME,
    admin: process.env.DBADMIN,
    password: process.env.DBPASSWORD
  },
  i18n: {
    syncFiles: defTrue,
    autoReload: defTrue,
    updateFiles: defTrue,
    locales: ['fr', 'en', 'es', 'it', 'ru', 'ar']
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
      $default: process.env.WEBPORT
    }
  }
}

const store = new Confidence.Store(config)
exports.get = (key) => store.get(key, criteria)
exports.meta = (key) => store.meta(key, criteria)
