import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

@Injectable()
export class StockageService implements OnModuleInit {
  private nomFichierData =
    process.env.DATA_FILE_PATH || './data/campusrate.json';

  async onModuleInit() {
    const dossier = path.dirname(this.nomFichierData);
    await fs.mkdir(dossier, { recursive: true });

    try {
      await fs.readFile(this.nomFichierData, 'utf-8');
    } catch {
      const donneesVides = { places: [], reviews: [] };
      const texte = JSON.stringify(donneesVides, null, 2);
      await fs.writeFile(this.nomFichierData, texte, 'utf-8');
    }
  }

  async lireDonnees() {
    try {
      const contenu = await fs.readFile(this.nomFichierData, 'utf-8');
      return JSON.parse(contenu);
    } catch {
      throw new InternalServerErrorException(
        'Le fichier de données est absent ou invalide.',
      );
    }
  }

  async ecrireDonnees(donnees: any) {
    const texte = JSON.stringify(donnees, null, 2);
    await fs.writeFile(this.nomFichierData, texte, 'utf-8');
  }
}
