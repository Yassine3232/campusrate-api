import { Injectable, NotFoundException } from '@nestjs/common';
import { StockageService } from '../stockage/stockage.service';
import { PlacesService } from '../places/places.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { Place } from '../places/entities/place.entity';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly stockageService: StockageService,
    private readonly placesService: PlacesService,
  ) {}

  private genererId(): string {
    const temps = Date.now().toString();
    const hasard = Math.floor(Math.random() * 10000).toString();
    return 'rev_' + temps + hasard; // colle rev_ devant le temps et un nombre pour faire un id unique
  }

  // ajouter un nouvel avis pour un endroit et mettre a jour les statistiques
  async creerPourEndroit(
    placeId: string,
    dto: CreateReviewDto,
  ): Promise<Review> {
    const donnees = await this.stockageService.lireDonnees();

    let endroit: Place | null = null;

    for (let i = 0; i < donnees.places.length; i++) {
      if (donnees.places[i].id === placeId) {
        endroit = donnees.places[i];
        break;
      }
    }

    if (!endroit) {
      throw new NotFoundException(
        `L'endroit avec l'identifiant ${placeId} n'existe pas.`,
      );
    }

    const maintenant = new Date().toISOString();

    const appreciation: Review = {
      id: this.genererId(),
      placeId: placeId,
      authorName: dto.authorName,
      rating: dto.rating,
      comment: dto.comment,
      createdAt: maintenant,
      updatedAt: maintenant,
    };

    donnees.reviews.push(appreciation);
    this.placesService.recalculerStats(endroit, donnees.reviews);
    endroit.updatedAt = maintenant;

    await this.stockageService.ecrireDonnees(donnees);
    return appreciation;
  }

  // lister tous les avis associes a un endroit
  async trouverParEndroit(placeId: string): Promise<Review[]> {
    const donnees = await this.stockageService.lireDonnees();

    let endroitExiste = false;

    for (let i = 0; i < donnees.places.length; i++) {
      if (donnees.places[i].id === placeId) {
        endroitExiste = true;
        break;
      }
    }

    if (!endroitExiste) {
      throw new NotFoundException(
        `L'endroit avec l'identifiant ${placeId} n'existe pas.`,
      );
    }

    const listeAppreciations: Review[] = [];

    for (let i = 0; i < donnees.reviews.length; i++) {
      if (donnees.reviews[i].placeId === placeId) {
        listeAppreciations.push(donnees.reviews[i]);
      }
    }

    return listeAppreciations;
  }

  // rechercher un avis par son identifiant
  async findOne(id: string): Promise<Review> {
    const donnees = await this.stockageService.lireDonnees();

    let appreciationTrouvee: Review | null = null;

    for (let i = 0; i < donnees.reviews.length; i++) {
      if (donnees.reviews[i].id === id) {
        appreciationTrouvee = donnees.reviews[i];
        break;
      }
    }

    if (!appreciationTrouvee) {
      throw new NotFoundException(
        `L'appréciation avec l'identifiant ${id} n'existe pas.`,
      );
    }

    return appreciationTrouvee;
  }

  // modifier les informations d un avis existant
  async update(id: string, dto: UpdateReviewDto): Promise<Review> {
    const donnees = await this.stockageService.lireDonnees();

    let appreciationModifiee: Review | null = null;

    for (let i = 0; i < donnees.reviews.length; i++) {
      if (donnees.reviews[i].id === id) {
        appreciationModifiee = donnees.reviews[i];
        break;
      }
    }

    if (!appreciationModifiee) {
      throw new NotFoundException(
        `L'appréciation avec l'identifiant ${id} n'existe pas.`,
      );
    }

    if (dto.authorName !== undefined) {
      appreciationModifiee.authorName = dto.authorName;
    }

    if (dto.rating !== undefined) {
      appreciationModifiee.rating = dto.rating;
    }

    if (dto.comment !== undefined) {
      appreciationModifiee.comment = dto.comment;
    }

    const maintenant = new Date().toISOString();
    appreciationModifiee.updatedAt = maintenant;

    let endroit: Place | null = null;

    for (let i = 0; i < donnees.places.length; i++) {
      if (donnees.places[i].id === appreciationModifiee.placeId) {
        endroit = donnees.places[i];
        break;
      }
    }

    if (endroit) {
      this.placesService.recalculerStats(endroit, donnees.reviews);
      endroit.updatedAt = maintenant;
    }

    await this.stockageService.ecrireDonnees(donnees);
    return appreciationModifiee;
  }

  // supprimer un avis et mettre a jour les statistiques du place concerne
  async remove(id: string): Promise<void> {
    const donnees = await this.stockageService.lireDonnees();

    let indexAppreciation = -1;

    for (let i = 0; i < donnees.reviews.length; i++) {
      if (donnees.reviews[i].id === id) {
        indexAppreciation = i;
        break;
      }
    }

    if (indexAppreciation === -1) {
      throw new NotFoundException(
        `L'appréciation avec l'identifiant ${id} n'existe pas.`,
      );
    }

    const idEndroit = donnees.reviews[indexAppreciation].placeId;

    const appreciationsRestantes: Review[] = [];

    for (let i = 0; i < donnees.reviews.length; i++) {
      if (i !== indexAppreciation) {
        appreciationsRestantes.push(donnees.reviews[i]);
      }
    }

    donnees.reviews = appreciationsRestantes;

    let endroit: Place | null = null;

    for (let i = 0; i < donnees.places.length; i++) {
      if (donnees.places[i].id === idEndroit) {
        endroit = donnees.places[i];
        break;
      }
    }

    if (endroit) {
      this.placesService.recalculerStats(endroit, donnees.reviews);
      endroit.updatedAt = new Date().toISOString();
    }

    await this.stockageService.ecrireDonnees(donnees);
  }
}




