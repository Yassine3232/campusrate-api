// service places
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PlacesRepository } from './places.repository';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { ReviewsRepository } from '../reviews/reviews.repository';
import { PlaceStatus } from '../common/enums/status.enum';

@Injectable()
export class PlacesService {
  constructor(
    private readonly placesRepository: PlacesRepository,
    @Inject(forwardRef(() => ReviewsRepository))
    private readonly reviewsRepository: ReviewsRepository,
  ) {}

  // recalculer les stats d un endroit
  async mettreAJourStats(placeId: string): Promise<void> {
    const stats = await this.reviewsRepository.calculateStats(placeId);
    await this.placesRepository.updateById(placeId, {
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount,
    });
  }

  // ajouter un nouvel endroit
  async create(dto: CreatePlaceDto) {
    return this.placesRepository.create({
      ...dto,
      services: dto.services || [],
      status: dto.status || PlaceStatus.ACTIVE,
      averageRating: null,
      reviewCount: 0,
    });
  }

  // lister les endroits avec pagination
  async findAll(query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filtre: Record<string, any> = {};
    if (query.category) {
      filtre.category = query.category;
    }

    const { data, totalItems } = await this.placesRepository.findAll(
      filtre,
      skip,
      limit,
    );

    const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  // chercher un endroit par id
  async findOne(id: string) {
    const doc = await this.placesRepository.findById(id);
    if (!doc) {
      throw new NotFoundException(`L'endroit avec l'identifiant ${id} n'existe pas.`);
    }
    return doc;
  }

  // modifier un endroit
  async update(id: string, dto: UpdatePlaceDto) {
    const doc = await this.placesRepository.updateById(id, dto);
    if (!doc) {
      throw new NotFoundException(`L'endroit avec l'identifiant ${id} n'existe pas.`);
    }
    return doc;
  }

  // supprimer un endroit s il n a pas d avis
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const nbAvis = await this.reviewsRepository.countByPlaceId(id);
    if (nbAvis > 0) {
      throw new ConflictException(
        'Impossible de supprimer un endroit qui possède des appréciations.',
      );
    }

    await this.placesRepository.deleteById(id);
  }
}
