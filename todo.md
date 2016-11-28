# TODO

## Robin

### Enlever hapi-demo.

### Migrer démo de s'inscrire et de se connecter:
* vers page "abonnezVous" (s'inscrire)
* vers page "meConnecter" (se connecter)

### Migrer switcher la langue
* vers les 6 badges qui sont dans toutes les pages.

### Lorsqu'on change de langue:
* aller à la page courante
* au lieu d'aller à la page d'accueil

### Liens avec dièse: comment ouvrir l'onglet approprié ?
* ex: /fr/apropos#plan-du-site
* aka deep-linking

### 1 fichier json par page du site, autoLoad dans var "data".
* dans HTML je pourrai remplacer hardcoded par des includes, ex: <%- data.title %>
- fichier json de la page Accueil te fournira les données nécessaire de cette page.

### Enlever templates et partials qui ne servent plus
* login+inscription
* accueilDemo
* doc
* docs
* multilingual
* partials
* pick-language
* woot

### Couch-DB
* peupler bd
* requête pour, et affichage de, la page d'accueil: articles et brèves
* breadcrumb et pagination (x2), en fonction des données et du contexte
* moteur de recherche basic (Lucene?)

## Feature Requests (pas du tout urgent)

### Filtrage supplémentaire des résultats de recherche
--- aka drilldown

### Dans les forms:
* rétablir les valeurs du user actuel lorsqu'il consulte.
* Ne pas obliger user de faire SUBMIT ; que ça se fasse automatiquement.

## Alain

### Ajouter templates aux partials:
* partial/commentaire
* partial/resultatDeRecherche

### JSON à développer:
* pour articles
* pour brèves
* pour commentaires
* pour évaluations par users: pertinence, qualité, appréciation, etc.
* pour chaque page de notre site
* pour personnes
* pour membres
* pour organisations
* pour groupes
* pour tâches
* pour activités

### Supprimer le projet "alaintest".

## Robert (FYI)

### Programmer autrement la production du JSON (très petit changement):
* enlever dernière virgule dans tous les JSON.
* remplacer quote par ("\" & quote)

### Cerner la portion du contenu d'une ressource
* qui sera affiché dans les pages du journal.
* balise pourrait être "contenu".
* à distinguer de la balise actuelle "description".

----

## Next
* Translations interface

## Details
### JSON content
* Dangling commas
* Cache contents (linked, how?)
* Updates?
* Import into CouchDB

### Site Structure (routes)
* Main pages (about, faq, etc.)
* Sections
* Subjects

### User roles
* Anon
* Just register (new user, unconfirmed)
* Connected
* Actions

### Templates
* Improve responsive layout
* CSS/SASS: custom colors, etc.

### Database
* Secondary indexes (views)
* Pagination

### Performance
* Monitoring
* Internal cache
* Redis (cache, sessions)
* Etags
* Multiple databases (replication)
* Multiple nodejs
* HAProxy
* Varnish
* Minify/Aggregate CSS
* Minify/Aggregate JS
