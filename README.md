# CampusRate API (TP2)

API NestJS permettant de consulter et noter des endroits du campus. Ce TP2 remplace le stockage du TP1 par MongoDB et ajoute la validation et la sécurité de base.

## Nouveautés du TP2

- **MongoDB & Mongoose** : remplacement du stockage fichier par deux collections (`places` et `reviews`).
- **Validation** : `ValidationPipe` global avec rejet des champs inconnus (`whitelist` et `forbidNonWhitelisted`).
- **Sécurité** : Helmet pour les en-têtes HTTP et CORS configuré via `.env`.
- **Gestion des erreurs** : filtre Problem Details (RFC 9457), doublon de nom traduit en `409 Conflict`.
- **Agrégation MongoDB ($group)** : calcul automatique de la moyenne et du nombre d'avis par endroit.

## Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer le .env (MONGO_URI=mongodb://127.0.0.1:27017/campusrate-dev)
cp .env.example .env

# 3. Lancer MongoDB avec Docker (si pas déjà lancé)
docker run -d -p 27017:27017 --name mongo-campusrate mongo

# 4. Démarrer l'API
npm run start:dev
```

- **Swagger** : [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Postman** : collection dans `campusrate.postman_collection.json`

## Justifications

- **Deux collections séparées** : un endroit peut avoir beaucoup d'avis, ce qui risquerait de dépasser la taille limite de 16 Mo de MongoDB. Les avis ont aussi leur propre cycle de vie.
- **Index unique sur le nom** : empêche la création de doublons pour un même endroit (`409 Conflict`).
- **Suppression** : impossible de supprimer un endroit s'il possède encore des avis (`409 Conflict`) afin d'éviter les avis orphelins.
