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
  server.settings.app = {
    siteTitle: Config.get('/app/siteTitle'),
    languages: Config.get('/i18n/locales')
  }

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
            name: Config.get('/db/name'),
            reader: Config.get('/db/reader'),
            readerPassword: Config.get('/db/readerPassword')
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

lab.experiment('Home Page View', () => {
  lab.beforeEach((done) => {
    request = {
      method: 'GET',
      url: '/'
    }

    done()
  })

  lab.test('home page renders properly', (done) => {
    server.inject(request, (response) => {
      Code.expect(response.result).to.match(/<a href="\/fr\/accueil">ACCUEIL<\/a>/i)
      Code.expect(response.statusCode).to.equal(200)

      done()
    })
  })
})

lab.experiment('/fr (404)', () => {
  lab.beforeEach((done) => {
    request = {
      method: 'GET',
      url: '/fr'
    }

    done()
  })

  lab.test('/fr doesn\'t exist, ok)', (done) => {
    server.inject(request, (response) => {
      Code.expect(response.statusCode).to.equal(404)

      done()
    })
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

lab.experiment('Home Page View (en)', () => {
  lab.beforeEach((done) => {
    request = {
      method: 'GET',
      url: '/en/accueil'
    }

    done()
  })

  lab.test('en home page renders properly (/en/accueil)', (done) => {
    server.inject(request, (response) => {
      Code.expect(response.result).to.match(/<h3 id='page-main-title' class='text-center'>Welcome to PhdAdmin<\/h3>/i)
      Code.expect(response.result).to.match(/<a href="\/fr\/accueil"><span title="Français" class="badge">Fr<\/span>&nbsp;<\/a>/i)
      Code.expect(response.result).to.match(/<a href="\/en\/accueil"><span title="English" class="badge alert">En<\/span>&nbsp;<\/a>/i)
      Code.expect(response.statusCode).to.equal(200)

      done()
    })
  })
})
