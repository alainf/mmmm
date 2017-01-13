# Workflow de Livecode à CouchDB

## Responsabilités
### Responsabilités de Livecode
* à compléter*

1. Web spider
1. Génère des fichiers json conformes
1. Lit ses propres fichiers json

Notez que les json traités par Livecode utilisent des entitées html
plutôt que l'utf-8.

### Responsabilités de CouchDB
1. Prend les json générés par Livecode (les entitées html converties en utf-8)
1. Offre des index secondaires (views)
1. Read-only: les documents ne sont jamais édités dans CouchDB

### Responsabilités de Hapi
1. Routes
1. Templates
   * donne une version camelCase des champs
   * obtient les sous-documents

## Point de contact
L'interface entre Livecode (et les json qu'il produit) et
CouchDB (où les documents reposent, **read-only**).
