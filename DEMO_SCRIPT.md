# Guide de Démonstration Vidéo — CampusRate TP2

Ce guide décrit pas à pas les 8 scénarios obligatoires à présenter dans la vidéo de démonstration pour le TP2, ainsi que les options démontrables.

---

## Préparation avant la vidéo
1. Démarrer votre instance MongoDB (locale ou conteneur) sur le port 27017.
2. Ouvrir **MongoDB Compass** et se connecter à `mongodb://127.0.0.1:27017`.
3. Démarrer l'API :
   ```bash
   npm run start:dev
   ```
4. Ouvrir **Postman** et importer `campusrate.postman_collection.json`.

---

## Déroulement des 8 scénarios vidéo

### 1. Création valide d'un endroit
- **Requête :** `01 - Création valide d'un endroit`
- **Méthode / URL :** `POST /api/v1/places`
- **Résultat attendu :**
  - Statut HTTP `201 Created`
  - En-tête `Location` contenant `/api/v1/places/<id>`
  - Corps de réponse au format JSON contenant `id` (string), `averageRating: null`, `reviewCount: 0`.
  - Absence stricte des champs internes MongoDB `_id` et `__v`.

### 2. Lecture de la ressource persistée (+ MongoDB Compass)
- **Requête :** `02 - Lecture de la ressource persistée`
- **Méthode / URL :** `GET /api/v1/places/{{placeId}}`
- **Résultat attendu :**
  - Statut HTTP `200 OK`
  - Les données correspondent exactement à l'endroit créé.
- **Action vidéo :** Basculer sur **MongoDB Compass**, rafraîchir la base `campusrate-dev` > collection `places`, et montrer le document enregistré dans MongoDB avec son `_id` ObjectId et ses dates `createdAt` / `updatedAt`.

### 3. Persistance après redémarrage de l'API
- **Action vidéo :** Dans le terminal, arrêter l'API avec `Ctrl + C`.
- Relancer l'API : `npm run start:dev`.
- **Requête :** `03 - Persistance après redémarrage`
- **Méthode / URL :** `GET /api/v1/places/{{placeId}}`
- **Résultat attendu :**
  - Statut HTTP `200 OK`.
  - La ressource est toujours disponible, prouvant la persistance réelle dans MongoDB (et non en mémoire ou dans un fichier temporaire).

### 4. Création avec propriété obligatoire manquante
- **Requête :** `04 - Propriété obligatoire manquante`
- **Méthode / URL :** `POST /api/v1/places` (sans le champ `name`)
- **Résultat attendu :**
  - Statut HTTP `400 Bad Request`
  - Format RFC 9457 `application/problem+json` (`type`, `title`, `status`, `detail`, `instance`).
  - Le champ `detail` mentionne clairement le problème de validation sur le champ obligatoire.

### 5. Valeur invalide pour une propriété contrôlée
- **Requête :** `05 - Valeur invalide pour un champ contrôlé`
- **Méthode / URL :** `POST /api/v1/places/{{placeId}}/reviews` (avec `rating: 9`)
- **Résultat attendu :**
  - Statut HTTP `400 Bad Request`
  - Format `application/problem+json` indiquant que la note maximale permise est 5.

### 6. Propriété inconnue envoyée par le client (Mass Assignment Protection)
- **Requête :** `06 - Propriété inconnue envoyée par le client`
- **Méthode / URL :** `POST /api/v1/places` (avec `"proprieteInconnue": "valeur_pirate"`)
- **Résultat attendu :**
  - Statut HTTP `400 Bad Request`
  - Rejet automatique grâce aux options globales `ValidationPipe` (`whitelist: true, forbidNonWhitelisted: true`).

### 7. Modification valide d'un endroit
- **Requête :** `07 - Modification valide d'un endroit`
- **Méthode / URL :** `PATCH /api/v1/places/{{placeId}}` (modification de la `description`)
- **Résultat attendu :**
  - Statut HTTP `200 OK`
  - La description est mise à jour, les autres champs sont conservés et `updatedAt` est actualisé.

### 8. Tentative de modifier un champ contrôlé par le serveur
- **Requête :** `08 - Tentative de modifier un champ contrôlé par le serveur`
- **Méthode / URL :** `PATCH /api/v1/places/{{placeId}}` (tentative d'envoyer `"averageRating": 5.0`)
- **Résultat attendu :**
  - Statut HTTP `400 Bad Request`
  - Le client ne peut pas falsifier les champs gérés par le serveur (`averageRating`, `reviewCount`, `id`, `createdAt`, `updatedAt`).

---

## Scénarios supplémentaires démontrables (Options)

- **Option M1 (Index unique) :** Requête `09 - Conflit d'unicité sur le nom` → `409 Conflict`.
- **Option M2 (Agrégation $group) :**
  - Requête `10 - Publier un avis valide` → `201 Created`.
  - Requête `11 - Vérification du recalcul agrégé` → note moyenne recalculée avec `$group`.
- **Stratégie de suppression :** Requête `12 - Conflit suppression d'un endroit avec avis` → `409 Conflict` (refus de suppression d'un parent avec avis).
