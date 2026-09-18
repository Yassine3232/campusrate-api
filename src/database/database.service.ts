import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Place } from '../places/entities/place.entity';
import { Review } from '../reviews/entities/review.entity';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private nomFichierData =
    process.env.DATA_FILE_PATH || './data/campusrate.json';

  async onModuleInit() {
    await this.verifierFichier();
  }

  private async verifierFichier() {
    const dossier = path.dirname(this.nomFichierData);
    await fs.mkdir(dossier, { recursive: true });

    try {
      await fs.readFile(this.nomFichierData, 'utf-8');
    } catch {
      const texte = JSON.stringify({ places: [], reviews: [] }, null, 2);
      await fs.writeFile(this.nomFichierData, texte, 'utf-8');
    }
  }

  async lireDonnees(): Promise<{ places: Place[]; reviews: Review[] }> {
    let contenu = '';

    try {
      contenu = await fs.readFile(this.nomFichierData, 'utf-8');
    } catch {
      throw new InternalServerErrorException(
        'Impossible de lire le fichier de données.',
      );
    }

    let donnees: { places: Place[]; reviews: Review[] };

    try {
      donnees = JSON.parse(contenu);
    } catch {
      throw new InternalServerErrorException(
        'Le fichier de données JSON est corrompu ou invalide.',
      );
    }

    if (!donnees.places || !donnees.reviews) {
      throw new InternalServerErrorException(
        'La structure du fichier de données est invalide.',
      );
    }

    return donnees;
  }

  async ecrireDonnees(donnees: {
    places: Place[];
    reviews: Review[];
  }): Promise<void> {
    const texte = JSON.stringify(donnees, null, 2);
    await fs.writeFile(this.nomFichierData, texte, 'utf-8');
  }
}
