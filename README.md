# CampusRate API

Une API REST simple développée avec NestJS pour noter et consulter des endroits du campus (bibliothèques, cafétérias, espaces d'étude).

Ce projet a été initialisé au **TP1** (gestion de base en mémoire / fichier) et a été mis à niveau pour le **TP2** avec une base de données **MongoDB** et des mesures de sécurité.

---

## Ce qui a été ajouté dans le TP2

1. **Base de données MongoDB avec Mongoose** :
   - Les données ne sont plus stockées dans un fichier ou en mémoire, elles sont maintenant sauvegardées dans MongoDB.
   - Création de deux collections : `places` (les endroits) et `reviews` (les avis).
   - Les schémas Mongoose utilisent `timestamps: true` pour gérer automatiquement les dates d'ajout et de modification.

2. **Sécurité et validation** :
   - **Validation globale** : utilisation de `ValidationPipe` avec `whitelist: true` et `forbidNonWhitelisted: true`. Si quelqu'un envoie un champ non prévu, la requête est directement rejetée avec une erreur 400.
   - **Helmet** : configuration des en-têtes HTTP sécurisés.
   - **CORS** : seules les adresses autorisées dans le `.env` peuvent faire des requêtes.

3. **Gestion des erreurs (RFC 9457)** :
   - Mise en place d'un filtre global `ProblemDetailsFilter` qui retourne des erreurs claires au format `application/problem+json`.
   - Si un nom d'endroit existe déjà, l'erreur MongoDB (code 11000) est interceptée et retourne un code `409 Conflict`.

4. **Calcul automatique des moyennes ($group)** :
   - Quand on ajoute ou supprime un avis, l'API recalcule toute seule la note moyenne et le nombre d'avis de l'endroit avec une requête d'agrégation MongoDB `$group`.

---

## Prérequis pour faire tourner le projet

- **Node.js** (version 20 ou plus récente)
- **MongoDB** en marche (localement sur le port 27017, ou via Docker avec `docker run -d -p 27017:27017 mongo`)

---

## Installation et démarrage

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Créer le fichier de configuration `.env` à partir de l'exemple :
   ```bash
   cp .env.example .env
   ```

   Vérifiez que votre fichier `.env` contient :
   ```text
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/campusrate-dev
   CORS_ORIGINS=http://localhost:5173
   ```

3. Lancer l'API en mode développement :
   ```bash
   npm run start:dev
   ```

4. Vérifier la qualité du code :
   ```bash
   npm run lint
   npm run build
   ```

---

## Documentation et tests

- **Swagger (interface de test dans le navigateur)** :  
  Quand l'API est lancée, ouvrez [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

- **Postman** :  
  La collection avec tous les scénarios de test est disponible dans le fichier `campusrate.postman_collection.json` (et `campusrate.postman_collection.yaml`).  
  Le fichier `DEMO_SCRIPT.md` explique l'ordre des requêtes pour la vidéo de démonstration.

---

## Choix techniques du TP2 (Explications simples)

### 1. Pourquoi deux collections séparées plutôt qu'imbriquées ? (Option M3)
Nous avons choisi de mettre les endroits dans `places` et les avis dans `reviews` (avec un lien `placeId`) :
- Si un endroit devient très populaire, il peut recevoir des centaines d'avis. Si on mettait tous les avis à l'intérieur de l'endroit, le document deviendrait trop lourd (MongoDB limite la taille d'un document à 16 Mo).
- Ça permet aussi de supprimer ou modifier un avis directement sans devoir charger tout l'endroit.

### 2. Pourquoi un index unique sur le nom ? (Option M1)
- Deux endroits ne doivent pas avoir le même nom sur le campus.
- Pour être sûr à 100% qu'aucun doublon n'est créé, on a mis `@Prop({ required: true, unique: true }) name: string` dans le schéma. MongoDB bloque les doublons et notre filtre transforme l'erreur en `409 Conflict`.

### 3. Stratégie de suppression
- Si on essaie de supprimer un endroit qui a déjà des avis, l'API refuse avec un code `409 Conflict`.
- On doit d'abord supprimer les avis pour pouvoir supprimer l'endroit. Cela évite d'avoir des avis "orphelins" qui pointent vers un endroit qui n'existe plus.
