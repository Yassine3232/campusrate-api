// demmarage nest
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ProblemDetailsFilter } from './common/filters/problem-details.filter';

async function bootstrap() {
  const portServeur = process.env.PORT;
  const fichierData = process.env.DATA_FILE_PATH;

  if (!portServeur) {
    throw new Error('Le port est manquant');
  }

  if (!fichierData) {
    throw new Error('Le fichier data est manquant');
  }

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(new ValidationPipe());
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

