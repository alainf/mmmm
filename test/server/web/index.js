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
      Code.expect(response.result).to.match(/<a target='_blank' href="\/fr\/detail\/lead-2016-12-01-18-00-01-random" title="Tooltip du hyperlien dont le href est dans path">Donald Trump nomme un banquier de Wall Street à la tête de l'économie américaine<\/a>/i)
      Code.expect(response.result).to.match(/<p class='strong'><a target='_blank' href="\/fr\/detail\/lead-2016-12-03-18-00-42-random">La régulation des goûts<\/a><\/p>/i)
      Code.expect(response.result).to.match(/<li><a href="\/fr\/section\/terme-2015-12-06-16-23-30-86966220628">À propos<\/a><\/li>/i)
      Code.expect(response.result).to.match(/<li><a href="\/fr\/sujet\/terme-2015-12-06-16-24-22-86966223762">Agriculture<\/a><\/li>/i)
      Code.expect(response.result).to.match(/<a href="\/fr\/accueil"><img src="\/img\/phdadmin_logo.png" alt="PhD Administration"><\/a>/i)
      Code.expect(response.result).to.match(/<li><a href="\/fr\/sujet\/terme-2015-12-06-16-24-49-86966225379">Droit<\/a><\/li>/i)
      Code.expect(response.result).to.match(/<h5 class='bloc-title'>En bref<\/h5>/i)

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
      Code.expect(response.result).to.match(/<a target='_blank' href="\/en\/detail\/lead-2016-12-01-18-00-01-random" title="Tooltip du hyperlien dont le href est dans path">Donald Trump nomme un banquier de Wall Street à la tête de l'économie américaine<\/a>/i)
      Code.expect(response.result).to.match(/<p class='strong'><a target='_blank' href="\/en\/detail\/lead-2016-12-03-18-00-42-random">La régulation des goûts<\/a><\/p>/i)
      Code.expect(response.result).to.match(/<li><a href="\/en\/section\/terme-2015-12-06-16-23-30-86966220628">About<\/a><\/li>/i)
      Code.expect(response.result).to.match(/<li><a href="\/en\/sujet\/terme-2015-12-06-16-24-22-86966223762">Agriculture<\/a><\/li>/i)
      Code.expect(response.result).to.match(/<a href="\/en\/accueil"><img src="\/img\/phdadmin_logo.png" alt="PhD Administration"><\/a>/i)
      Code.expect(response.result).to.match(/<li><a href="\/en\/sujet\/terme-2015-12-06-16-24-49-86966225379">Law<\/a><\/li>/i)
      Code.expect(response.result).to.match(/<h5 class='bloc-title'>In short<\/h5>/i)

      Code.expect(response.statusCode).to.equal(200)

      done()
    })
  })
})

lab.experiment('Trump nomme banquier (fr)', () => {
  lab.beforeEach((done) => {
    request = {
      method: 'GET',
      url: '/fr/detail/lead-2016-12-01-18-00-01-random'
    }

    done()
  })

  lab.test('fr Trump nomme banquier detail page renders properly (/fr/detail/lead-2016-12-01-18-00-01-random)', (done) => {
    server.inject(request, (response) => {
      Code.expect(response.result).to.match(/<h2>Trump nomme banquier de Wall Street à la tête de l'économie américaine<\/h2>/i)
      Code.expect(response.result).to.match(/<a href="\/fr\/section\/terme-2015-12-06-16-23-37-86966221060">Politique<\/a>/i)
      Code.expect(response.result).to.match(/<a href="\/fr\/sujet\/terme-2015-12-06-16-24-54-86966225669">Économie<\/a>/i)
      Code.expect(response.result).to.match(/<dd><p>lead-2016-12-01-18-00-01-random<\/p><\/dd>/i)
      Code.expect(response.result).to.match(/<img src="\/img\/phdadmin_logo.png" alt="Accueil" title="Consulter la page d&#39;accueil">/i)

      Code.expect(response.statusCode).to.equal(200)

      done()
    })
  })
})
