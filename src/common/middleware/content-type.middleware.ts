import {
  Injectable,
  NestMiddleware,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Middleware de verification Content-Type (Option H3)
// Rejette avec 415 Unsupported Media Type toute requete POST ou PATCH qui ne specifie pas application/json
@Injectable()
export class ContentTypeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const methodesAvecCorps = ['POST', 'PATCH', 'PUT'];

    if (methodesAvecCorps.includes(req.method)) {
      const contentType = req.headers['content-type'];
      // Si la requete a un contenu et que ce n est pas du json
      const hasContentLength = req.headers['content-length'] && Number(req.headers['content-length']) > 0;
      const isTransferChunked = req.headers['transfer-encoding'] === 'chunked';

      if (hasContentLength || isTransferChunked) {
        if (!contentType || !contentType.toLowerCase().includes('application/json')) {
          throw new UnsupportedMediaTypeException(
            "L'en-tête Content-Type doit être 'application/json'",
          );
        }
      }
    }

    next();
  }
}
