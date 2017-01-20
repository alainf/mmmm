'use strict'

// npm
const Lab = require('lab')
const Code = require('code')
const Hapi = require('hapi')
const Vision = require('vision')
const H2O2 = require('h2o2')
const Inert = require('inert')
const I18N = require('hapi-i18n')
const ContextApp = require('hapi-context-app')

// self
const Config = require('../../../config')
const PickLanguage = require('../../../plugins/pick-language/index')
const HomePlugin = require('../../../server/web/index')

const lab = exports.lab = Lab.script()
let request
let server

lab.beforeEach((done) => {
  const plugins = [H2O2, ContextApp, Inert, PickLanguage, Vision]
  server = new Hapi.Server()
  server.connection({ port: Config.get('/port/web') })
  server.settings.app = { siteTitle: Config.get('/app/siteTitle') }

  server.register(plugins, (err) => {
    if (err) { return done(err) }

    server.views({
      engines: { html: require('lodash-vision') },
      path: './server/web'
    })

    server.register(
      {
        register: HomePlugin,
        options: {
          templateCached: Config.get('/cache/web'),
          db: {
            url: Config.get('/db/url'),
            name: Config.get('/db/name')
          }
        }
      },
      (err) => { if (err) { return done(err) } }
    )

    server.register(
      {
        register: I18N,
        options: {
          locales: Config.get('/i18n/locales'),
          directory: 'locales'
        }
      },
      (err) => { if (err) { return done(err) } }
    )

    done()
  })
})

lab.experiment('Home Page View (fr)', () => {
  lab.beforeEach((done) => {
    request = {
      method: 'GET',
      url: '/fr/accueil'
    }

    done()
  })

  lab.test('fr home page renders properly (/fr/accueil)', (done) => {
    server.inject(request, (response) => {
      Code.expect(response.result).to.match(/<h3 id='page-main-title' class='text-center'>Accueil de PhdAdmin<\/h3>/i)
      Code.expect(response.result).to.match(/<a href="\/fr\/accueil"><span title="Français" class="badge alert">Fr<\/span>&nbsp;<\/a>/i)
      Code.expect(response.result).to.match(/<a href="\/en\/accueil"><span title="English" class="badge">En<\/span>&nbsp;<\/a>/i)

      Code.expect(response.statusCode).to.equal(200)

      done()
    })
  })
})
