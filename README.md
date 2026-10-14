# CampusRate API — TP2

API REST permettant à la communauté étudiante de consulter des endroits et services du campus et de publier des appréciations accompagnées d'une note.
Cette version (TP2) fait évoluer l'architecture initiale vers une persistance robuste avec **MongoDB**, des schémas **Mongoose**, une validation stricte des entrées et une sécurisation renforcée (Helmet, CORS, limitation de débit, limitation de corps, journalisation).

---

## Objectif

CampusRate offre une plateforme centralisée pour répertorier les espaces du campus (bibliothèques, laboratoires informatiques, espaces d'étude, cafétérias, etc.) et recueillir les avis des étudiants avec calcul automatique des moyennes de satisfaction.

---

## Fonctionnalités principales (TP2)

- **Persistance NoSQL avec MongoDB & Mongoose** : remplacement intégral du fichier JSON par deux collections MongoDB (`places` et `reviews`).
- **Gestion des endroits (`places`)** : création, consultation détaillée, modification partielle, suppression contrôlée.
- **Gestion des appréciations (`reviews`)** : publication liée à un endroit parent, consultation unitaire et par endroit, mise à jour, suppression.
- **Agrégation MongoDB ($group)** : calcul dynamique et immédiat de la note moyenne (`averageRating`) et du nombre d'avis (`reviewCount`) sans intervention du client.
- **Validation globale stricte** : rejet immédiat des requêtes contenant des champs inconnus ou non autorisés (`whitelist: true, forbidNonWhitelisted: true`).
- **Protection des données gérées par le serveur** : impossibilité d'injecter ou de modifier `id`, `averageRating`, `reviewCount`, `createdAt` ou `updatedAt`.
- **Format d'erreurs standardisé** : gestion centralisée au standard RFC 9457 Problem Details (`application/problem+json`).
- **Sécurisation HTTP** : en-têtes sécurisés avec Helmet, restriction CORS configurable, limitation de débit (Throttler), limitation de la taille du corps (100 kb), vérification du Content-Type.
- **Journalisation structurée** : logs HTTP de niveau INFO (méthode, chemin, statut, durée) et journalisation distincte de niveau ERROR sans fuite de données sensibles.

---

## Technologies

- **NestJS** (v12) avec Node.js & TypeScript
- **MongoDB** & **Mongoose** (`@nestjs/mongoose`, `mongoose`)
- **Validation & Transformation** : `class-validator`, `class-transformer`, `joi`
- **Sécurité** : `helmet`, `@nestjs/throttler`
- **Documentation** : Swagger / OpenAPI (`@nestjs/swagger`)
- **Tests & Démonstration** : Postman (`campusrate.postman_collection.json`)

---

## Installation et configuration

### Prérequis

- Node.js (v20+ ou v24+)
- npm (v10+ ou v11+)
- Une instance **MongoDB** active (locale sur `mongodb://127.0.0.1:27017` ou distante via MongoDB Atlas)

### Installation des dépendances

```bash
npm ci
```

### Configuration des variables d'environnement

Copier le fichier d'exemple :

```bash
cp .env.example .env
```

Variables requises dans `.env` :

| Variable | Description | Exemple |
| :--- | :--- | :--- |
| `PORT` | Port d'écoute du serveur HTTP | `3000` |
| `MONGO_URI` | URI de connexion MongoDB (avec base de données explicite) | `mongodb://127.0.0.1:27017/campusrate-dev` |
| `CORS_ORIGINS` | Origines autorisées par CORS (séparées par une virgule) | `http://localhost:5173` |
| `THROTTLE_TTL` | Fenêtre temporelle du rate limiter en millisecondes (défaut : 60000) | `60000` |
| `THROTTLE_LIMIT` | Nombre maximal de requêtes autorisées par fenêtre (défaut : 100) | `100` |

> **Validation au démarrage** : L'application utilise `Joi` pour valider la configuration au démarrage. Si `MONGO_URI` est absent ou invalide, l'application refuse de démarrer avec un message d'erreur explicite.

---

## Démarrage, lint et compilation

```bash
# Mode développement avec rechargement à chaud
npm run start:dev

# Mode production
npm run start:prod

# Analyse de code (linter oxlint)
npm run lint

# Compilation TypeScript
npm run build
```

---

## Documentation Swagger / OpenAPI

Lorsque le serveur est démarré, la documentation interactive Swagger est accessible à :
👉 **`http://localhost:3000/api/docs`**

Elle présente :
- Toutes les routes versionnées sous `/api/v1/...`
- Les schémas des DTOs avec leurs contraintes et exemples
- Les codes de statut HTTP documentés (200, 201, 204, 400, 404, 409, 413, 415)
- Les structures d'erreur `application/problem+json`

---

## Architecture des données MongoDB

### 1. Justification Référence vs Imbrication (Option M3)
Nous avons choisi un modèle à **deux collections distinctes avec référence** (`places` et `reviews`), où chaque document `review` stocke l'identifiant `placeId` de son endroit parent :
- **Cycle de vie indépendant** : Les avis possèdent leur propre cycle de vie (consultation unitaire, modification, suppression indépendante sans charger l'endroit parent).
- **Volume et croissance non bornée** : Un endroit très fréquenté peut accumuler des centaines ou milliers d'avis au fil des sessions. L'imbrication dans un sous-document de `Place` risquerait d'atteindre la limite BSON de 16 Mo par document.
- **Performance des requêtes** : Permet de requêter la liste des endroits sans rapatrier inutilement l'intégralité du texte de tous les avis associés.

### 2. Index et justifications (Option M1)
- **Index unique sur `places.name`** (`{ name: 1 }, { unique: true }`) :
  - *Justification* : Garantit au niveau de la base de données qu'aucun doublon d'endroit n'est créé avec le même libellé.
  - *Traduction d'erreur* : En cas de doublon, le pilote MongoDB émet l'erreur `11000`, automatiquement interceptée et traduite en HTTP `409 Conflict` au format Problem Details.
- **Index de recherche sur `reviews.placeId`** (`{ placeId: 1 }`) :
  - *Justification* : Optimise les opérations fréquentes de filtrage (`GET /places/:placeId/reviews`), de comptage et d'agrégation des statistiques par endroit sans balayage complet de collection (*COLLSCAN* évité).

### 3. Stratégie de suppression
- **Refus de suppression avec conflit (409 Conflict)** : Si un client tente de supprimer un endroit qui possède encore des avis (`reviewCount > 0`), l'API refuse l'opération et renvoie un `409 Conflict`.
- *Justification* : Cette stratégie empêche formellement l'apparition d'avis orphelins dans la base de données, préservant l'intégrité référentielle des données.

### 4. Migration des identifiants (TP1 vers TP2)
- Dans le TP1, les identifiants étaient générés manuellement sous forme de chaînes préfixées (ex. `plc_179...`).
- Dans le TP2, MongoDB génère des `_id` de type `ObjectId`. Grâce à la transformation `toJSON` configurée au niveau des schémas Mongoose, l'identifiant interne est projeté sous la propriété `id` sous forme de chaîne hexadécimale, tandis que `_id` et `__v` sont masqués.

---

## Options TP2 implémentées (33 points tentés, plafonnés à 30)

| Code | Option | Points | Description technique |
| :--- | :--- | :---: | :--- |
| **M1** | Index pertinents + index unique + gestion 409 | 6 pts | Index unique sur `name` (erreur 11000 → 409 Conflict) et index sur `reviews.placeId`. |
| **M2** | Agrégation MongoDB `$group` | 4 pts | Pipeline d'agrégation MongoDB (`calculateStats`) recalculant la note moyenne et le nombre d'avis sans exposer de pipeline client. |
| **M3** | Justification référence vs imbrication | 2 pts | Documentation complète de l'architecture découplée en deux collections dans le README. |
| **P1** | Allowlist explicite des filtres | 2 pts | Filtrage des endroits restreint au seul paramètre `category` via `PaginationQueryDto`. |
| **P2** | Propriétés modifiables explicitement sélectionnées | 2 pts | `UpdatePlaceDto` et `UpdateReviewDto` restreignent strictement les champs modifiables. |
| **H1** | Rate limiting | 4 pts | `@nestjs/throttler` configuré globalement avec limite de 100 requêtes / minute (statut 429). |
| **H2** | Limite de taille du corps HTTP (413) | 2 pts | Corps de requête plafonné à 100 kb avec Express, produisant une erreur 413 Payload Too Large. |
| **H3** | Vérification du Content-Type (415) | 2 pts | Middleware rejetant les requêtes POST/PATCH n'utilisant pas `application/json` avec 415. |
| **H4** | Restriction CORS par environnement | 2 pts | Origines CORS restreintes via la variable `CORS_ORIGINS` dans `.env`. |
| **H5** | Restriction explicite des méthodes HTTP permises | 1 pt | Déclaration explicite des verbes permises (`GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`) dans CORS. |
| **L1** | Journalisation INFO des requêtes normales | 3 pts | `LoggingMiddleware` journalisant la méthode, l'URL, le statut et la durée de chaque requête. |
| **L2** | Journalisation ERROR distincte sans fuite | 3 pts | `ProblemDetailsFilter` consignant les erreurs serveur et traces dans la console sans exposer de secrets ni d'URI Mongo au client. |

---

## Démonstration et tests (Phase 9)

Une collection Postman prête à l'emploi est incluse à la racine : `campusrate.postman_collection.json`.
Le fichier `DEMO_SCRIPT.md` détaille la séquence des 8 scénarios obligatoires à présenter pour la vidéo de démonstration.

---

## Limites connues

- **Authentification & rôles** : Cette version n'intègre pas de gestion d'utilisateurs authentifiés par jeton JWT (fonctionnalité reportée aux travaux ultérieurs).
- **Disponibilité MongoDB** : L'API dépend d'un serveur MongoDB accessible dès l'amorçage ; elle refuse de se déclarer prête en cas de panne de la base de données.
