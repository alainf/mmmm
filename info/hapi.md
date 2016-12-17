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

Le fichier config.js n'est utilisé que par manifest.js.

### Fichier manifest.js
Utilise [Glue][] pour assembler l'application. C'est là qu'on énumère
et configure les plugins utilisés, à partir de l'API de config.js.

[Confidence]: <https://github.com/hapijs/confidence>
[Glue]: <https://github.com/hapijs/glue/blob/master/API.md>
