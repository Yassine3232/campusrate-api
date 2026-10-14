import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ReviewsRepository } from './reviews.repository';
import { PlacesService } from '../places/places.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    @Inject(forwardRef(() => PlacesService))
    private readonly placesService: PlacesService,
  ) {}

  // ajouter un nouvel avis pour un endroit et mettre a jour les statistiques
  async creerPourEndroit(
    placeId: string,
    dto: CreateReviewDto,
  ): Promise<any> {
    // Verifier que l endroit parent existe bien
    await this.placesService.findOne(placeId);

    const doc = await this.reviewsRepository.create({
      placeId: placeId,
      authorName: dto.authorName,
      rating: dto.rating,
      comment: dto.comment,
    });

    // Recalculer les statistiques de l endroit
    await this.placesService.mettreAJourStats(placeId);

    return doc.toJSON();
  }

  // lister tous les avis associes a un endroit
  async trouverParEndroit(placeId: string): Promise<any[]> {
    // Verifier que l endroit parent existe bien (retourne 404 si inexistant)
    await this.placesService.findOne(placeId);

    const docs = await this.reviewsRepository.findByPlaceId(placeId);
    return docs.map((d) => d.toJSON());
  }

  // rechercher un avis par son identifiant
  async findOne(id: string): Promise<any> {
    const doc = await this.reviewsRepository.findById(id);

    if (!doc) {
      throw new NotFoundException(
        `L'appréciation avec l'identifiant ${id} n'existe pas.`,
      );
    }

    return doc.toJSON();
  }

  // modifier les informations d un avis existant
  async update(id: string, dto: UpdateReviewDto): Promise<any> {
    const avisExistant = await this.findOne(id);

    const donneesModifiees: Partial<Review> = {};

    if (dto.authorName !== undefined) {
      donneesModifiees.authorName = dto.authorName;
    }

    if (dto.rating !== undefined) {
      donneesModifiees.rating = dto.rating;
    }

    if (dto.comment !== undefined) {
      donneesModifiees.comment = dto.comment;
    }

    const doc = await this.reviewsRepository.updateById(id, donneesModifiees);

    if (!doc) {
      throw new NotFoundException(
        `L'appréciation avec l'identifiant ${id} n'existe pas.`,
      );
    }

    // Recalculer les statistiques de l endroit parent
    await this.placesService.mettreAJourStats(avisExistant.placeId);

    return doc.toJSON();
  }

  // supprimer un avis et mettre a jour les statistiques du place concerne
  async remove(id: string): Promise<void> {
    const avisExistant = await this.findOne(id);

    await this.reviewsRepository.deleteById(id);

    // Recalculer les statistiques de l endroit parent
    await this.placesService.mettreAJourStats(avisExistant.placeId);
  }
}
