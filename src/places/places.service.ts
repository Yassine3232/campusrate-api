import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { StockageService } from '../stockage/stockage.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { Place } from './entities/place.entity';
import { Review } from '../reviews/entities/review.entity';
import { PlaceStatus } from '../common/enums/status.enum';

@Injectable()
export class PlacesService {
  constructor(private readonly stockageService: StockageService) {}

  // generer un identifiant court unique pour un nouveau place
  private genererId(): string {
    const temps = Date.now().toString();
    const hasard = Math.floor(Math.random() * 10000).toString();
    return 'plc_' + temps + hasard; // colle plc_ devant le temps et un nombre pour faire un id unique
  }

  // recalculer la note moyenne et le nombre davis d un place
  recalculerStats(endroit: Place, reviews: Review[]) {
    const listeNotes: Review[] = [];

    for (let i = 0; i < reviews.length; i++) {
      if (reviews[i].placeId === endroit.id) {
        listeNotes.push(reviews[i]);
      }
    }

    endroit.reviewCount = listeNotes.length;

    if (listeNotes.length === 0) {
      endroit.averageRating = null;
    } else {
      let total = 0;

      for (let i = 0; i < listeNotes.length; i++) {
        total = total + listeNotes[i].rating;
      }

      const moyenne = total / listeNotes.length;
      endroit.averageRating = Math.round(moyenne * 100) / 100;
    }
  }

  // ajouter un nouveau place au fichier de donnees
  async create(dto: CreatePlaceDto): Promise<Place> {
    const donnees = await this.stockageService.lireDonnees();
    const maintenant = new Date().toISOString();

    let listeServices: string[] = [];

    if (dto.services) {
      listeServices = dto.services;
    }

    let statutEndroit = PlaceStatus.ACTIVE;

    if (dto.status) {
      statutEndroit = dto.status;
    }

    const endroit: Place = {
      id: this.genererId(),
      name: dto.name,
      description: dto.description,
      category: dto.category,
      address: dto.address,
      services: listeServices,
      status: statutEndroit,
      averageRating: null,
      reviewCount: 0,
      createdAt: maintenant,
      updatedAt: maintenant,
    };

    donnees.places.push(endroit);
    await this.stockageService.ecrireDonnees(donnees);
    return endroit;
  }

  // lister tous les endroits avec filtrage et pagination
  async findAll(query: PaginationQueryDto) {
    const donnees = await this.stockageService.lireDonnees();

    let listeEndroits: Place[] = [];

    if (query.category) {
      for (let i = 0; i < donnees.places.length; i++) {
        if (donnees.places[i].category === query.category) {
          listeEndroits.push(donnees.places[i]);
        }
      }
    } else {
      listeEndroits = donnees.places;
    }

    const totalItems = listeEndroits.length;
    const pageDemandee = query.page;
    const limite = query.limit;

    let totalPages = 0;

    if (totalItems > 0) {
      totalPages = Math.ceil(totalItems / limite);
    }

    const indexDebut = (pageDemandee - 1) * limite;
    const indexFin = indexDebut + limite;
    const elementsPage = listeEndroits.slice(indexDebut, indexFin);

    return {
      data: elementsPage,
      pagination: {
        page: pageDemandee,
        limit: limite,
        totalItems: totalItems,
        totalPages: totalPages,
      },
    };
  }

  // rechercher un endroit par son identifiant
  async findOne(id: string): Promise<Place> {
    const donnees = await this.stockageService.lireDonnees();

    let endroitTrouve: Place | null = null;

    for (let i = 0; i < donnees.places.length; i++) {
      if (donnees.places[i].id === id) {
        endroitTrouve = donnees.places[i];
        break;
      }
    }

    if (!endroitTrouve) {
      throw new NotFoundException(
        `L'endroit avec l'identifiant ${id} n'existe pas.`,
      );
    }

    return endroitTrouve;
  }

  // modifier les informations d un endroit existant
  async update(id: string, dto: UpdatePlaceDto): Promise<Place> {
    const donnees = await this.stockageService.lireDonnees();

    let endroitModifie: Place | null = null;

    for (let i = 0; i < donnees.places.length; i++) {
      if (donnees.places[i].id === id) {
        endroitModifie = donnees.places[i];
        break;
      }
    }

    if (!endroitModifie) {
      throw new NotFoundException(
        `L'endroit avec l'identifiant ${id} n'existe pas.`,
      );
    }

    if (dto.name !== undefined) {
      endroitModifie.name = dto.name;
    }

    if (dto.description !== undefined) {
      endroitModifie.description = dto.description;
    }

    if (dto.category !== undefined) {
      endroitModifie.category = dto.category;
    }

    if (dto.address !== undefined) {
      endroitModifie.address = dto.address;
    }

    if (dto.services !== undefined) {
      endroitModifie.services = dto.services;
    }

    if (dto.status !== undefined) {
      endroitModifie.status = dto.status;
    }

    endroitModifie.updatedAt = new Date().toISOString();

    await this.stockageService.ecrireDonnees(donnees);
    return endroitModifie;
  }

  // supprimer un place si aucune appreciation ne lui est liee
  async remove(id: string): Promise<void> {
    const donnees = await this.stockageService.lireDonnees();

    let indexEndroit = -1;

    for (let i = 0; i < donnees.places.length; i++) {
      if (donnees.places[i].id === id) {
        indexEndroit = i;
        break;
      }
    }

    if (indexEndroit === -1) {
      throw new NotFoundException(
        `L'endroit avec l'identifiant ${id} n'existe pas.`,
      );
    }

    let possedeAvis = false;

    for (let i = 0; i < donnees.reviews.length; i++) {
      if (donnees.reviews[i].placeId === id) {
        possedeAvis = true;
        break;
      }
    }

    if (possedeAvis) {
      throw new ConflictException(
        'Impossible de supprimer un endroit qui possède des appréciations.',
      );
    }

    const endroitsRestants: Place[] = [];

    for (let i = 0; i < donnees.places.length; i++) {
      if (i !== indexEndroit) {
        endroitsRestants.push(donnees.places[i]);
      }
    }

    donnees.places = endroitsRestants;

    await this.stockageService.ecrireDonnees(donnees);
  }
}







