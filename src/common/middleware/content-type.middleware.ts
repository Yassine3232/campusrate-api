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
    const methodesAvecCorps = ['POST', 'PATCH', 'PUT'];

    if (methodesAvecCorps.includes(req.method)) {
      const contentType = req.headers['content-type'];
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
