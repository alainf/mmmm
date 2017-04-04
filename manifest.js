'use strict'

const Confidence = require('confidence')
const Config = require('./config')
const criteria = { env: process.env.NODE_ENV }

const manifest = {
  $meta: 'This file configures the mmmmm app.',
  server: {
    app: {
      siteTitle: Config.get('/app/siteTitle'),
      languages: Config.get('/i18n/locales')
    },
    cache: 'catbox-redis',
    debug: { log: ['error'] },
    connections: { routes: { security: true } }
  },
  connections: [{
    host: 'localhost',
    port: Config.get('/port/web'),
    labels: ['web']
  }],
  registrations: [
    {
      plugin: {
        register: 'hapi-i18n',
        options: {
          locales: Config.get('/i18n/locales'),
          defaultLocale: 'fr',
          autoReload: Config.get('/i18n/autoReload'),
          updateFiles: Config.get('/i18n/updateFiles'),
          indent: '  ',
          directory: 'locales'
        }
      }
    },
    {
      plugin: {
        register: 'hapi-favicon',
        options: { path: 'assets/img/favicon.ico' }
      }
    },
    {
      plugin: {
        register: 'hapi-graceful-pm2',
        options: {
          timeout: (parseInt(process.env.PM2_GRACEFUL_TIMEOUT) || 8000) - 500
        }
      }
    },
    {
      plugin: {
        options: {
          db: {
            url: Config.get('/db/url'),
            name: Config.get('/db/name')
          },
          cookie: {
            password: Config.get('/cookie/password'),
            secure: Config.get('/cookie/secure')
          }
        },
        register: 'hapi-couchdb-login'
        // register: './plugins/login/index'
      },
      options: { routes: { prefix: '/user' } }
    },
    {
      plugin: 'hapijs-status-monitor',
      options: { routes: { prefix: '/system' } }
    },
    {
      plugin: 'lout',
      options: { routes: { prefix: '/system' } }
    },
    { plugin: 'hapi-context-app' },
    { plugin: 'hapi-context-credentials' },
    { plugin: 'h2o2' },
    { plugin: 'inert' },
    { plugin: 'vision' },
    { plugin: './plugins/pick-language/index' },
/*
    {
      plugin: {
        register: './server/pro/index',
        options: {
          templateCached: Config.get('/cache/web'),
          db: {
            url: Config.get('/db/url'),
            name: Config.get('/db/name')
          }
        }
      },
      options: { routes: { prefix: '/{languageCode}/pro' } }
    },
*/
    {
      plugin: {
        register: './server/demo/index',
        options: {
          templateCached: Config.get('/cache/web'),
          db: {
            url: Config.get('/db/url'),
            name: Config.get('/db/name')
          }
        }
      },
      options: { routes: { prefix: '/{languageCode}/demo' } }
    },
    {
      plugin: {
        register: './server/web/index',
        options: {
          templateCached: Config.get('/cache/web'),
          db: {
            url: Config.get('/db/url'),
            name: Config.get('/db/name')
          }
        }
      }
    }
  ]
}

const store = new Confidence.Store(manifest)
exports.get = (key) => store.get(key, criteria)
exports.meta = (key) => store.meta(key, criteria)
