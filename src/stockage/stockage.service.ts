// service pour gerer le fichier json
import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

@Injectable()
export class StockageService implements OnModuleInit {
  // chemin vers le fichier
  private nomFichierData =
    process.env.DATA_FILE_PATH || './data/campusrate.json';

  // au lancement cree fichier si il n existe pas
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

  // lit le fichier
  async lireDonnees() {
    try {
      const contenu = await fs.readFile(this.nomFichierData, 'utf-8');
      return JSON.parse(contenu);
    } catch {
      throw new InternalServerErrorException('Fichier invalide ou absent');
    }
  }

  // ecrit dans le fichier
  async ecrireDonnees(donnees: any) {
    await fs.writeFile(this.nomFichierData, JSON.stringify(donnees, null, 2), 'utf-8');
  }
}
