# CampusRate API

API REST permettant à la communauté étudiante de consulter des endroits et services du campus et de publier des appréciations accompagnées d'une note.

## Objectif

CampusRate offre une plateforme centralisée pour répertorier les espaces du campus (bibliothèques, laboratoires informatiques, espaces d'étude, cafétérias, etc.) et recueillir les avis des étudiants avec calcul automatique des moyennes de satisfaction.

## Fonctionnalités

- Gestion complète des endroits (`places`) : création, consultation détaillée, modification partielle, suppression contrôlée.
- Filtrage par catégorie et pagination avec plafond strict.
- Gestion des appréciations (`reviews`) : publication liée à un endroit, consultation unitaire et par endroit, mise à jour, suppression.
- Recalcul automatique et immédiat de la note moyenne (`averageRating`) et du nombre d'avis (`reviewCount`).
- Rejet strict des propriétés système non autorisées à la création et modification.
- Gestion uniforme des erreurs au standard RFC 9457 Problem Details (`application/problem+json`).
- Persistance locale asynchrone dans un fichier JSON via `node:fs/promises`.

## Technologies

- NestJS (Node.js & TypeScript)
- Express
- Swagger / OpenAPI (`@nestjs/swagger`)
- class-validator & class-transformer
- Postman

## Installation et configuration

### Prérequis

- Node.js (v20+ ou v24+)
- npm

### Installation

```bash
npm install
```

### Configuration

Copier le fichier d'exemple des variables d'environnement :

```bash
cp .env.example .env
```

Variables requises :
- `PORT` : Port d'écoute du serveur HTTP (ex. `3000`).
- `DATA_FILE_PATH` : Chemin vers le fichier JSON de persistance locale (ex. `./data/campusrate.json`).

L'application valide la présence de ces variables au démarrage et refuse de démarrer si l'une d'elles est absente ou invalide.

## Démarrage, lint et compilation

### Démarrage

```bash
# Mode développement
npm run start

# Mode surveillance (watch)
npm run start:dev

# Mode production
npm run start:prod
```

### Linter et compilation

```bash
# Vérification du code
npm run lint

# Compilation TypeScript
npm run build
```

## Swagger UI

Une fois le serveur démarré, la documentation interactive Swagger UI est accessible à l'adresse suivante :
`http://localhost:3000/api/docs`

Elle permet d'explorer les routes, les schémas de requêtes et de réponses, ainsi que d'exécuter des requêtes directement depuis l'interface.

## Persistance des données

Les données sont conservées dans un fichier JSON local dont le chemin est configurable avec `DATA_FILE_PATH` (valeur de développement : `./data/campusrate.json`).

Format du fichier :

```json
{
  "places": [],
  "reviews": []
}
```

- Le fichier est créé automatiquement au démarrage s'il est absent, y compris son dossier parent.
- La lecture et l'écriture sont entièrement asynchrones (`node:fs/promises`).
- Un fichier JSON invalide produit une erreur contrôlée au format Problem Details (500) qui n'expose ni pile d'exécution, ni chemin local, ni contenu brut du fichier.
- Les données restent disponibles après un redémarrage du serveur.

Séparation des responsabilités :

| Couche | Fichier | Rôle |
| :--- | :--- | :--- |
| Accès aux données | `src/stockage/stockage.service.ts` | Seul endroit qui lit et écrit le fichier JSON (`lireDonnees`, `ecrireDonnees`) |
| Logique métier | `src/places/places.service.ts`, `src/reviews/reviews.service.ts` | Règles métier, cohérence des références et recalcul de `averageRating` et `reviewCount` |
| Entrées HTTP | `src/places/places.controller.ts`, `src/reviews/reviews.controller.ts` | Routes, codes de statut et en-tête `Location` |
| Validation | `src/places/dto/`, `src/reviews/dto/`, `src/common/dto/` | DTO de création, de modification et de paramètres de requête |
| Erreurs | `src/common/filters/problem-details.filter.ts` | Filtre global produisant `application/problem+json` |

## Contrat d'API REST et justifications de design

| Élément | Choix technique | Justification |
| :--- | :--- | :--- |
| **Noms de ressources** | `places`, `reviews` | Noms en anglais, au pluriel, en minuscules, sans verbe d'action, conformes aux conventions REST. |
| **Versionnement** | `/api/v1/...` | Version majeure dans l'URI pour garantir la stabilité du contrat envers les consommateurs et permettre des évolutions futures sans rupture. |
| **Imbrication** | `/api/v1/places/:placeId/reviews` | Utilisée pour la création et la liste des avis car un avis dépend ontologiquement de l'endroit qu'il évalue. |
| **URI directes** | `/api/v1/reviews/:id` | Utilisées pour la consultation, la modification et la suppression unitaire d'un avis via son identifiant unique, évitant une profondeur d'URI inutile. |
| **En-tête Location** | `Location: /api/v1/{resource}/{id}` | Retourné lors des créations (201) pour indiquer l'URI canonique de la ressource créée. |
| **Plafond de pagination** | `@Max(50)` sur `limit` avec rejet 400 | Rejette explicitement avec une erreur 400 toute valeur supérieure à 50 au lieu de plafonner silencieusement, rendant le non-respect du contrat immédiatement visible au consommateur. |
| **Code 204 No Content** | `DELETE /places/:id`, `DELETE /reviews/:id` | Méthodes de suppression réussies retournant une réponse au corps vide conformément aux standards HTTP. |
| **Code 409 Conflict** | Suppression d'un endroit avec avis | Refus de supprimer un endroit lié à des appréciations existantes pour préserver l'intégrité référentielle des données. |
| **Valeurs par défaut** | `services: []`, `status: ACTIVE` | Un endroit créé sans services ne contient aucun service et sans état précisé devient `ACTIVE`; les deux valeurs sont documentées dans Swagger. |
| **Format d'erreur** | `application/problem+json` (RFC 9457) | Format standardisé `{ type, title, status, detail, instance }` garantissant un traitement uniforme des erreurs par les clients. |

## Limites connues

- La persistance utilise un fichier JSON local mono-instance, non optimisé pour des charges d'écriture massivement concurrentes dans un environnement multi-serveurs.
- L'authentification des utilisateurs n'est pas couverte dans cette première version (TP1).
