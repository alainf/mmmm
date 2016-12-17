# HapiJS, un aperçu

## Structure de répertoires
```
mmmm
├── assets
│   ├── css
│   ├── img
│   │   ├── dans-articles
│   │   ├── groupes
│   │   ├── membres
│   │   ├── placeholders
│   │   └── unused
│   └── js
│       └── vendor
├── data
├── ddoc
│   └── app
│       └── views
├── info
│   ├── add-to-couch
│   │   ├── bad
│   │   └── new
│   ├── astuces
│   ├── metadata
│   ├── new
│   └── samples
├── locales
├── plugins
│   └── pick-language
├── server
│   ├── demo
│   ├── pro
│   └── web
└── templates
    └── partials
```

## Configuration
L'ensemble de la configuration est géré par quatre fichiers:

* package.json
* .env
* config.js
* manifest.js

### Fichier package.json
Configure un module NodeJS (via npm/yarn) et énumère tous les
modules dont on dépend pour le développement et la production.
C'est aussi là qu'on trouvera les scripts (run dev, run start, etc.)

Tous les (386739) modules publiques se trouvent sur [npm][].
On peut [chercher les (1473) modules hapi][npm-hapi], mais franchement,
avec près de 400,000 modules, ce n'est pas si simple de s'y retrouver.

### Fichier .env
On doit configurer ces valeurs selon notre environnement:

* SITETITLE
* DBURL
* DBNAME
* DBADMIN
* DBPASSWORD
* WEBPORT

Ce fichier ne sera pas ajouté à git pour deux raisons: il varie selon
l'environnement et contient des secrets (DBPASSWORD).

Le fichier .env n'est utilisé que par config.js.

### Fichier config.js
Utilise [Confidence][] pour la configuration générale de l'application
et s'adapte aussi aux environnement de développement et de production.
C'est là entre autre que les langues sont configurées.

Le fichier config.js est utilisé par manifest.js pour l'assemblage
et par les autres fichiers JavaScript de l'application.

### Fichier manifest.js
Utilise [Glue][] pour assembler l'application. C'est là qu'on énumère
et configure les plugins utilisés, à partir de l'API de config.js.

## Coeur de l'application
Deux fichiers forment le coeur de l'application:

* index.js
* server.js

### index.js
C'est un boilerplate de moins de 10 lignes, qu'on peut réutiliser tel
quel dans d'autres projets du genre. Puisqu'il est si court, en voici
la source:
```
'use strict'
const Glue = require('glue')
const Manifest = require('./manifest')
const composeOptions = { relativeTo: __dirname }
module.exports = Glue.compose.bind(Glue, Manifest.get('/'), composeOptions)
```

Le fichier index.js n'est utilisé que par server.js.

### server.js
Ce fichier est responsable d'assembler les plugins selon le manifeste
et de mettre à jour le Design document CouchDB quand il change. C'est
le point d'entrée de l'application.

Il fait environ 20 lignes dont plus de la moitié est boilerplate:
```
'use strict'
const Composer = require('./index')

// Assemble the application and start the server
Composer((err, server) => {
  if (err) { throw err }
  server.start((err) => {
    if (err) { throw err }
    console.log(new Date())
    console.log('\nStarted the web server on port ' + server.info.port)
  })
})
```

On peut le lancer manuellement avec
```
node server # ou node server.js
```

Ou encore via un script npm/yarn:
```
yarn run dev    # mode développement
yarn run start  # mode production
```

Voir le champ scripts de package.json pour plus de détails.

## Plugins
Un plugin est un module npm, mais tous les modules ne sont pas des plugins.
Ici, les plugins sont spécifiques à hapi tandis que les modules adressent
tous les besoins JavaScript.

L'application est composé de plugins de trois types:

* Core (plugins officiels de HapiJS)
* Third party (incluant nos propres plugins réutilisables)
* Custom (code sur mesure pour notre application: routes, etc.)

### Core
On peut compter sur 75 modules [hapi-core][], pour l'authentification,
les templates, la validation et bien plus.

### Third party
On trouvera sur npm [1473 modules hapi][npm-hapi] en vrac.

Nous maintenons certains de ces modules:

* [hapi-context-app][] ([sur GitHub][hapi-context-app github])
* [hapi-couchdb-login][] ([sur GitHub][hapi-couchdb-login github])

Un plugin n'a pas besoin d'être gros, voici un exemple, hapi-context-app:
```
exports.register = function (server, options, next) {
  server.ext('onPreResponse', function (request, reply) {
    if (request.response.variety && request.response.variety === 'view' && request.server.settings && request.server.settings.app) {
      request.response.source.context = request.response.source.context || {}
      request.response.source.context.app = request.server.settings.app
    }
    return reply.continue()
  })

  next()
}
```

En gros, ce plugin insère les champs de configuration de l'application
```server.settings.app``` dans le contexte de tous les templates via
l'extension ```onPreResponse```.

Un autre plugin important est [h2o2][] dont nous utilisont présentement
le fork [AVVS/h2o2][]. C'est un plugin pour faire un proxy http générique.
On l'utilise comme interface à CouchDB puisque ce dernier parle aussi
http.

### Custom
Il s'agit ici de tout le code particulier à notre application, séparé
en plugins. À date, le principal c'est server/web/index.js qui énumère
les routes et la majorité du code.

## CouchDB
Serveur de documents JSON écrit en erlang. Nous utilisons
la version 1.6.1, sachant que la version subséquente, 2.0, est sorti
il y a quelques mois seulement. La version 2 pourra être évaluée
ultérieurement et permettrait un meilleur *scaling* tout en demeurant
*backward compatible* à 99%.

Contrairement à la plupart des autres serveurs de bases de données,
CouchDB n'a pas de client particulier pour y accéder (ex.: mysql, mongo)
car tout client http (avec les méthodes GET, POST, PUT, DELETE, etc.)
peut interfacer avec CouchDB (comme curl). Pour cette raison,
le plugin [h2o2][] fait bien le travail.

### Interface d'administration
Notons aussi que CouchDB vient avec une interface web d'administration,
un peu comme phpMyAdmin pour MySQL à la différence que pour rouler
phpMyAdmin, on a besoin d'un serveur web (apache httpd, nginx, etc.),
de l'interpréteur PHP ainsi que d'un serveur MySQL tandis qu'avec CouchDB,
tout est fournis. L'interface d'administration se nomme futon et se trouve
en général à <http://localhost:5984/_utils> et une nouvelle interface est
aussi disponible, fauxton.

Futon et fauxton permettent de créer des bases de données,
des utilisateurs et d'éditer des documents dont les *design documents*.
On peut y tester nos views, par exemple.

**Note importante**: sachez cependant que notre application hapi
va écraser les changements aux *design documents* à partir
des fichiers dans ```ddoc/```.

### Design doc
Un *design document* contient le code source nécessaire côté CouchDB,
encodé dans un document JSON. Son _id doit commencer par ```_design/```,
par exemple:

```
{
  "_id": "_design/app",
  "_rev": "1-abcdefg",
  "views": {
    "front": {
      "map": "function (doc) { if (doc.pertinence && doc.affichage === 'breves') { emit(doc.pertinence) } }",
      "reduce": "_count"
    }
  },
  "lists": {
    ...
  }
}
```

C'est la forme du document tel qu'il apparaitra dans CouchDB
(le champ ```_rev``` pourrait varier) mais heureusement, on n'aura pas
à le construire à la main. On utilisera des fichiers selon cette structure:

```
mmmm
└── ddoc
    └── app
        ├── views
        └── lists
```

Chaque fichier avec l'extension ```.js```
du répertoire ```ddoc/app/views```
est un module avec un champ ```map``` et un champ optionnel ```reduce```.

La valeur de ```reduce``` peut être une fonction ou une chaine parmi:

* _sum
* _count
* _stats (à vérifier)

La valeur de ```map``` doit être une fonction.

Le répertoire ddoc contient les *design documents*. Le sous répertoire
```app``` devient le _id ```_design/app```

[Confidence]: <https://github.com/hapijs/confidence>
[Glue]: <https://github.com/hapijs/glue/blob/master/API.md>
[npm]: <https://www.npmjs.com/>
[npm-hapi]: <https://www.npmjs.com/search?q=hapi>
[hapi-core]: <https://github.com/hapijs?utf8=%E2%9C%93&q=&type=source>
[hapi-context-app]: <https://www.npmjs.com/package/hapi-context-app>
[hapi-couchdb-login]: <https://www.npmjs.com/package/hapi-couchdb-login>
[hapi-context-app github]: <https://github.com/millette/hapi-context-app>
[hapi-couchdb-login github]: <https://github.com/millette/hapi-couchdb-login>
[h2o2]: <https://github.com/hapijs/h2o2>
[AVVS/h2o2]: <https://github.com/AVVS/h2o2/tree/feat/upgrade-to-hapi-15>
