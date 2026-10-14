import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

const TITRES: Record<number, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  409: 'Conflict',
  413: 'Payload Too Large',
  415: 'Unsupported Media Type',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
};

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const contexte = host.switchToHttp();
    const reponse = contexte.getResponse<Response>();
    const requete = contexte.getRequest<Request>();

    let statut = HttpStatus.INTERNAL_SERVER_ERROR;
    let detail = 'Une erreur interne inattendue est survenue.';

    if (exception instanceof HttpException) {
      statut = exception.getStatus();
      const contenu = exception.getResponse();

      if (typeof contenu === 'string') {
        detail = contenu;
      } else if (typeof contenu === 'object' && contenu !== null) {
        const obj = contenu as any;
        detail = Array.isArray(obj.message)
          ? obj.message.join(', ')
          : obj.message || obj.error || detail;
      }
    } else if (exception instanceof Error) {
      const err = exception as any;

      if (err.code === 11000) {
        statut = HttpStatus.CONFLICT;
        detail = 'Une ressource avec ces données existe déjà.';
      } else if (err.name === 'CastError' || err.name === 'ValidationError') {
        statut = HttpStatus.BAD_REQUEST;
        detail = 'Données invalides.';
      } else if (err.type === 'entity.too.large' || err.status === 413) {
        statut = HttpStatus.PAYLOAD_TOO_LARGE;
        detail = 'Le corps de la requête dépasse la taille maximale autorisée.';
      } else {
        this.logger.error(`Erreur sur ${requete.method} ${requete.url}: ${err.message}`, err.stack);
      }
    }

    const titre = TITRES[statut] || 'Erreur';

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
