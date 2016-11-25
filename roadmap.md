# Roadmap

# FAIT

## Étapes préliminaires de Alain

1. Design
1. Markup HTML
1. Markup CSS
1.Contenu du site, en JSON ; produit par Livecode.

## Étapes préliminaires de Robin

1. Framework hapi pour templates lodash  <-- ordre (en cours)
   * hapi
   * lodash-vision
1. Framework hapi + CouchDB
   * update automatique du design doc

# À FAIRE

## Accueil

1. Page d'accueil et articles (CouchDB)
   * view CouchDB des articles en ordre
   * pagination (en bas de page)
   * pagination dans le breadcrumb (précédente et suivante)
   * breadcrumb
   * switcher de langue
   * remplir sections et sujets (termes du niveau en question).
1. Blocs «En bref»
   * sont comme les articles, mais plus simples: juste titre, soustitre (facultatif) et contenu.
   * breves sont les articles où data.contenu.length < que le seuil minimale pour les articles.

## Views semblables superficiellement à Accueil

NB: Non, pas superficiellement; ils sont quasi-identiques.
NB: Ces pages ont tous les éléments de l'Accueil.
NB: Différence c'est les données-de-départ dans les blocs Sections et Sujets. IOW, un sous-ensemble.

1. Sections
1. Sujets
1. Groupes

##  View resultats-de-recherche, vu que ceci est paginé aussi

1. Engin de recherche
   * Chercher
   * Trier
   * Filter
   * Pagination
1. drilldown faceted search (Lucene)
1. enregistrer et re-effectuer des recherches
1. requêtes/views, pour peupler notamment les nombreux tableaux, exemple leurs favoris.

Lorsque ci-dessus seront complétés, nous aurons le journal que TOUS les users utiliseront, abonné ou pas

1. Pages génériques (quasi-statiques) qui sont partagées par tous les users
   * À propos
   * Sous-pages d'À propos ??
1. Gestionnaire de FAQ
1. Agenda
1. Bottin
1. Aide en ligne (aidez-moi)

1. Utilisateurs
   * Enregistrement, login, logout
   * Rôles: anonyme, connecté, admin
1. Page utilisateur
1. Identité utilisateur
1. Préférences utilisateur
1. Participer (utilisateur)

On distingue abonnés des anonymes (abonnezVous, meConnecter, meDeconnecter, Favoris, Moi, etc)

Nous offrirons aux abonnés un layer de features supplémentaires 

1. Calendrier utilisateur
1. Favoris utilisateur
1. Notifications utilisateur (m'aviser)
1. Historique utilisateur
1. Agenda utilisateur
1. Météo utilisateur
1. ajouts et annotations in-situo
1. personalisation en fonction de leur profile et préférences (explicites et tacites).

## Personalisation

Stockage et affichage de leurs données, trace(s) de leurs interactions, etc.

1. Javascript-client
   * features programmés qui ne sont pas faisables qu'avec HTML et CSS.
   * AJAX
   * enregistrer automatiquement, sans obliger user d'enregistrer.

## Dimension transactionnelle

1. Paiement
1. dons
1. déduction en fonction de leur participation: logs, calculs

## Étapes post-dev
1. Hébergement du Couch
1. Hébergement du site
