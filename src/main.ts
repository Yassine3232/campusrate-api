// demmarage nest
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const helmet = require('helmet');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
import { AppModule } from './app.module';
import { ProblemDetailsFilter } from './common/filters/problem-details.filter';

async function bootstrap() {
  const portServeur = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Option H2 : Limitation de la taille du corps de requete a 100kb
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ limit: '100kb', extended: true }));

  // Helmet ajoute des en-tetes de securite HTTP (ex. X-Frame-Options, X-Content-Type-Options)
  // Il ne remplace pas la validation ni l'authentification
  app.use(helmet());

  // CORS restreint quels navigateurs peuvent lire les reponses de cette API
  // Il ne bloque pas les clients non-navigateurs (ex. Postman, serveurs)
  const originesAutorisees = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
  app.enableCors({
    origin: originesAutorisees,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // whitelist  : proprietes inconnues des DTO sont ignorees silencieusement
  // forbidNonWhitelisted : proprietes inconnues declenchent une erreur 400
  // transform  : convertit les valeurs vers les types des DTO (ex. string -> number)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new ProblemDetailsFilter());

  // swagger pour tester l api
  const config = new DocumentBuilder()
    .setTitle('API CampusRate')
    .setDescription('Api pour noter des lieux')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(Number(portServeur));
}

bootstrap();
