import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const contexte = host.switchToHttp();
    const reponse = contexte.getResponse<Response>();
    const requete = contexte.getRequest<Request>();

    let statut = HttpStatus.INTERNAL_SERVER_ERROR;
    let titre = 'Internal Server Error';
    let detail = 'Une erreur interne inattendue est survenue.';

    if (exception instanceof HttpException) {
      statut = exception.getStatus();

      if (statut === HttpStatus.BAD_REQUEST) {
        titre = 'Bad Request';
      } else if (statut === HttpStatus.NOT_FOUND) {
        titre = 'Not Found';
      } else if (statut === HttpStatus.CONFLICT) {
        titre = 'Conflict';
      } else if (statut === HttpStatus.UNPROCESSABLE_ENTITY) {
        titre = 'Unprocessable Entity';
      } else if (statut === HttpStatus.TOO_MANY_REQUESTS) {
        titre = 'Too Many Requests';
      } else if (statut === HttpStatus.PAYLOAD_TOO_LARGE) {
        titre = 'Payload Too Large';
      } else if (statut === HttpStatus.UNSUPPORTED_MEDIA_TYPE) {
        titre = 'Unsupported Media Type';
      } else {
        titre = 'Erreur';
      }

      const contenuErreur = exception.getResponse();

      if (typeof contenuErreur === 'string') {
        detail = contenuErreur;
      } else if (typeof contenuErreur === 'object' && contenuErreur !== null) {
        const objetErreur = contenuErreur as any;

        if (Array.isArray(objetErreur.message)) {
          detail = objetErreur.message.join(', ');
        } else if (typeof objetErreur.message === 'string') {
          detail = objetErreur.message;
        } else if (typeof objetErreur.error === 'string') {
          detail = objetErreur.error;
        }
      }
    } else if (exception instanceof Error) {
      const erreur = exception as any;

      if (erreur.code === 11000) {
        // doublon sur un index unique
        statut = HttpStatus.CONFLICT;
        titre = 'Conflict';
        detail = 'Une ressource avec ces données existe déjà.';
      } else if (
        erreur.name === 'CastError' ||
        erreur.name === 'ValidationError'
      ) {
        // id ou donnees mongoose invalides
        statut = HttpStatus.BAD_REQUEST;
        titre = 'Bad Request';
        detail = 'Données invalides.';
      } else if (erreur.type === 'entity.too.large' || erreur.status === 413) {
        // body trop lourd
        statut = HttpStatus.PAYLOAD_TOO_LARGE;
        titre = 'Payload Too Large';
        detail = 'Le corps de la requête dépasse la taille maximale autorisée.';
      } else {
        // log l erreur dans la console sans la montrer au client
        this.logger.error(
          `Erreur sur ${requete.method} ${requete.url}: ${erreur.message}`,
          erreur.stack,
        );
      }
    }

    reponse.setHeader('Content-Type', 'application/problem+json');
    reponse.status(statut).json({
      type: 'about:blank',
      title: titre,
      status: statut,
      detail: detail,
      instance: requete.url,
    });
  }
}
