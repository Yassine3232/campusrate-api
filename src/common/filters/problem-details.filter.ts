import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
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
      // Traduit les erreurs MongoDB / Mongoose sans exposer les details internes
      const erreur = exception as any;

      if (erreur.code === 11000) {
        // Violation d un index unique -> 409 Conflict
        statut = HttpStatus.CONFLICT;
        titre = 'Conflict';
        detail = 'Une ressource avec ces données existe déjà.';
      } else if (
        erreur.name === 'CastError' ||
        erreur.name === 'ValidationError'
      ) {
        // Document invalide cote Mongoose -> 400 Bad Request
        statut = HttpStatus.BAD_REQUEST;
        titre = 'Bad Request';
        detail = 'Données invalides.';
      }
      // Toute autre erreur reste 500 sans exposer le message brut du pilote
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
