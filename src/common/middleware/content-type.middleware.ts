import {
  Injectable,
  NestMiddleware,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// verifie que le body est en json
@Injectable()
export class ContentTypeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (['POST', 'PATCH'].includes(req.method)) {
      const taille = Number(req.headers['content-length'] || 0);
      const isChunked = req.headers['transfer-encoding'] === 'chunked';

      if (taille > 0 || isChunked) {
        const type = req.headers['content-type'];
        if (!type || !type.includes('application/json')) {
          throw new UnsupportedMediaTypeException("L'en-tête Content-Type doit être 'application/json'");
        }
      }
    }
    next();
  }
}
