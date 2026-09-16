import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const portServeur = process.env.PORT;
  const cheminFichierData = process.env.DATA_FILE_PATH;

  if (!portServeur || isNaN(Number(portServeur))) {
    throw new Error(
      "La variable d'environnement PORT est obligatoire et doit être un nombre valide.",
    );
  }

  if (!cheminFichierData || cheminFichierData.trim() === '') {
    throw new Error(
      "La variable d'environnement DATA_FILE_PATH est obligatoire.",
    );
  }

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  await app.listen(Number(portServeur));
}

bootstrap();
