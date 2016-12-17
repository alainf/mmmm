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
L'ensemble de la configuration est géré par trois fichiers:

* .env
* config.js
* manifest.js

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
Tout le reste de l'application est composé de plugins de trois types:

* Core (plugins officiels de HapiJS)
* Third party (incluant nos propres plugins réutilisables)
* Custom (code sur mesure pour notre application: routes, etc.)


[Confidence]: <https://github.com/hapijs/confidence>
[Glue]: <https://github.com/hapijs/glue/blob/master/API.md>
