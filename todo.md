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

### Dans le template profil
* afficher qu'un bloc à la fois, cacher les autres; vs toggle actuel.


## Alain

### Réunir tous les todos = DONE
* dans les fichiers sur mon poste
* dans les courriels
* en examinant le site

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

### Avoir tout le JSON nécessaire
--- dans data/ ou dans CouchDB
--- pour l'affichage complet de la page d'accueil (articles, layout, brèves, etc.)

### Ajouter templates aux partials:
* partial/commentaire
* partial/resultatDeRecherche

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

## Commentaires en vrac sur le serveur web

### Plus de data dans la DB, plus représentatif
### Plus grand usage des données dans les templates et dans le code
### Se donner un roadmap; bien séparer les étapes pour connaitre le progrès et le chemin à faire
### Hébergement dev et prod: est-ce qu'il y a déjà un serveur (machine) dans le portrait?
--- Je crois que oui, qu'il ya un serveur. Je m'informerai.
* now.sh (node/docker)
* digital ocean (générique)
* cloudant (couchdb)
* ngrok (partage local en dev)

## Commentaires en vrac sur la gestion du projet

### Utiliser le issue tracker de github (public) pour la gestion du projet; avantage d'être lié aux commits
### Les grandes lignes peuvent se faire sur Framateam
### Tagguer les issues: feature, bug, etc.
### Classer les issues selon un roadmap, par version (0.1.0, 0.2.0, etc.)
### Grosso-modo, créer un issue pour chaque URL disponible sur le site en dev actuellement
### Établir les différents modèles (schémas) avec Joi
### Test unitaires (avec Lab, de hapijs) et tests d'acceptations

----

Remplir sujets et sections contextuellement
De: Alain Farmer <alain_farmer@yahoo.com>
Date: Nov 17 at 10:33 PM
To: Robin Millette 

Ce folder "taxonomies", au premier niveau,
qui contient un fichier json pour chaque terme,
plus spécifiquement juste un alias vers le json correspondant dans Collections.

C'est avec ce folder "taxonomies"
que mon livecode [re]génére "breadcrumb" dans les jsons de nos Collections.

Je t'en ai parlé ce soir,
et j'en reparle dans ce courriel,
car il me vient à l'esprit que
tu pourrais exploiter ce folder "taxonomies"
pour générer un GRAPHE (arborescence) des termes qui qualifient nos ressources.
Plus spécifiquement, tu pourrais avoir les SECTIONS et les SUJETS sous forme de graphe.

L'utilité c'est qu'on doit remplir les blocs SECTIONS et SUJETS
de la page Accueil, de toutes les pages SECTIONS, et de toutes les pages SUJETS.

Chaque page est un endroit précis dans ces deux graphes,
et les enfants de ce node (endroit) sont les termes qui vont dans ces blocs.

J'espère que ceci s'est avéré clair; on s'en reparlera.

----

## Logistique de collaboration

### FramaTeam
### Git
#### Git issues
#### Git labels
#### Git milestones
#### Git projects

----
