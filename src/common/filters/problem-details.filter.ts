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
