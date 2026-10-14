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
import { Place } from './schemas/place.schema';
import { ReviewsRepository } from '../reviews/reviews.repository';
import { PlaceStatus } from '../common/enums/status.enum';

@Injectable()
export class PlacesService {
  constructor(
    private readonly placesRepository: PlacesRepository,
    @Inject(forwardRef(() => ReviewsRepository))
    private readonly reviewsRepository: ReviewsRepository,
  ) {}

  // recalculer les statistiques d un endroit avec MongoDB
  async mettreAJourStats(placeId: string): Promise<void> {
    const stats = await this.reviewsRepository.calculateStats(placeId);
    await this.placesRepository.updateById(placeId, {
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount,
    });
  }

  // ajouter un nouveau place dans MongoDB
  async create(dto: CreatePlaceDto): Promise<any> {
    let listeServices: string[] = [];

    if (dto.services) {
      listeServices = dto.services;
    }

    let statutEndroit = PlaceStatus.ACTIVE;

    if (dto.status) {
      statutEndroit = dto.status;
    }

    try {
      const doc = await this.placesRepository.create({
        name: dto.name,
        description: dto.description,
        category: dto.category,
        address: dto.address,
        services: listeServices,
        status: statutEndroit,
        averageRating: null,
        reviewCount: 0,
      });
      return doc.toJSON();
    } catch (error: any) {
      if (error && error.code === 11000) {
        throw new ConflictException('Un endroit avec ce nom existe déjà.');
      }
      throw error;
    }
  }

  // lister tous les endroits avec filtrage et pagination
  async findAll(query: PaginationQueryDto) {
    const pageDemandee = query.page || 1;
    const limite = query.limit || 10;
    const skip = (pageDemandee - 1) * limite;

    const filtre: Record<string, any> = {};

    if (query.category) {
      filtre.category = query.category;
    }

    const { data, totalItems } = await this.placesRepository.findAll(
      filtre,
      skip,
      limite,
    );

    let totalPages = 0;

    if (totalItems > 0) {
      totalPages = Math.ceil(totalItems / limite);
    }

    return {
      data: data.map((d) => d.toJSON()),
      pagination: {
        page: pageDemandee,
        limit: limite,
        totalItems: totalItems,
        totalPages: totalPages,
      },
    };
  }

  // rechercher un endroit par son identifiant
  async findOne(id: string): Promise<any> {
    const doc = await this.placesRepository.findById(id);

    if (!doc) {
      throw new NotFoundException(
        `L'endroit avec l'identifiant ${id} n'existe pas.`,
      );
    }

    return doc.toJSON();
  }

  // modifier les informations d un endroit existant
  async update(id: string, dto: UpdatePlaceDto): Promise<any> {
    await this.findOne(id);

    const donneesModifiees: Partial<Place> = {};

    if (dto.name !== undefined) {
      donneesModifiees.name = dto.name;
    }

    if (dto.description !== undefined) {
      donneesModifiees.description = dto.description;
    }

    if (dto.category !== undefined) {
      donneesModifiees.category = dto.category;
    }

    if (dto.address !== undefined) {
      donneesModifiees.address = dto.address;
    }

    if (dto.services !== undefined) {
      donneesModifiees.services = dto.services;
    }

    if (dto.status !== undefined) {
      donneesModifiees.status = dto.status;
    }

    try {
      const doc = await this.placesRepository.updateById(id, donneesModifiees);

      if (!doc) {
        throw new NotFoundException(
          `L'endroit avec l'identifiant ${id} n'existe pas.`,
        );
      }

      return doc.toJSON();
    } catch (error: any) {
      if (error && error.code === 11000) {
        throw new ConflictException('Un endroit avec ce nom existe déjà.');
      }
      throw error;
    }
  }

  // supprimer un place si aucune appreciation ne lui est liee
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const nombreAvis = await this.reviewsRepository.countByPlaceId(id);

    if (nombreAvis > 0) {
      throw new ConflictException(
        'Impossible de supprimer un endroit qui possède des appréciations.',
      );
    }

    await this.placesRepository.deleteById(id);
  }
}
