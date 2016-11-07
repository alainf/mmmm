'use strict'

exports.register = function (server, options, next) {
  const sections = require('../../data/list1.json')
  const sujets = require('../../data/list2.json')
  const pages = [
    'abonnezVous',
    'accueil',
    'agenda',
    'apropos',
    'articles',
    'bottin',
    'enConstruction',
    'faq',
    'index',
    'meConnecter',
    'meDeconnecter',
    'moi',
    'page-ext',
    'page-int',
    'resultats',
    'section',
    'sujet',
    'tests'
  ]

  server.views({
    engines: { html: require('lodash-vision') },
    path: 'templates',
    partialsPath: 'templates/partials',
    isCached: options.templateCached
  })

  pages.forEach((page) => {
    server.route({
      method: 'GET',
      path: '/{languageCode}/' + page,
      handler: { view: page }
    })
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/',
    handler: {
      view: {
        template: 'index',
        context: { items: sections.items, items2: sujets.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: { view: 'pick-language' }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/partials',
    handler: { view: 'partials' }
  })

  server.route({
    method: 'GET',
    path: '/css/{param*}',
    handler: { directory: { path: 'assets/css/' } }
  })

  server.route({
    method: 'GET',
    path: '/js/{param*}',
    handler: { directory: { path: 'assets/js/' } }
  })

  server.route({
    method: 'GET',
    path: '/img/{param*}',
    handler: { directory: { path: 'assets/img/' } }
  })

  next()
}

exports.register.attributes = {
  name: 'web',
  dependencies: ['hapi-i18n', 'vision', 'inert']
}
