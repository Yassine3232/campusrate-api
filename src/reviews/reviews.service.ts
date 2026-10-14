// service reviews
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

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    @Inject(forwardRef(() => PlacesService))
    private readonly placesService: PlacesService,
  ) {}

  // ajouter un avis pour un endroit
  async creerPourEndroit(placeId: string, dto: CreateReviewDto): Promise<any> {
    await this.placesService.findOne(placeId);

    const doc = await this.reviewsRepository.create({
      placeId,
      ...dto,
    });

    await this.placesService.mettreAJourStats(placeId);
    return doc.toJSON();
  }

  // lister les avis d un endroit
  async trouverParEndroit(placeId: string): Promise<any[]> {
    await this.placesService.findOne(placeId);
    const docs = await this.reviewsRepository.findByPlaceId(placeId);
    return docs.map((d) => d.toJSON());
  }

  // trouver un avis par id
  async findOne(id: string): Promise<any> {
    const doc = await this.reviewsRepository.findById(id);
    if (!doc) {
      throw new NotFoundException(`L'appréciation avec l'identifiant ${id} n'existe pas.`);
    }
    return doc.toJSON();
  }

  // modifier un avis
  async update(id: string, dto: UpdateReviewDto): Promise<any> {
    const doc = await this.reviewsRepository.updateById(id, dto);
    if (!doc) {
      throw new NotFoundException(`L'appréciation avec l'identifiant ${id} n'existe pas.`);
    }
    await this.placesService.mettreAJourStats(doc.placeId);
    return doc.toJSON();
  }

  // supprimer un avis
  async remove(id: string): Promise<void> {
    const avis = await this.findOne(id);
    await this.reviewsRepository.deleteById(id);
    await this.placesService.mettreAJourStats(avis.placeId);
  }
}
