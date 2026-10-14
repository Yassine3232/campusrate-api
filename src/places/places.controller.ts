// controleur places
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  // ajoute un endroit
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creation d endroit' })
  @ApiResponse({ status: 201, description: 'Endroit cree' })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 409, description: 'Nom deja utilise' })
  async create(
    @Body() createPlaceDto: CreatePlaceDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const place = await this.placesService.create(createPlaceDto);
    res.setHeader('Location', `/api/v1/places/${(place as any).id || (place as any)._id}`);
    return place;
  }

  // liste les endroits avec filtres
  @Get()
  @ApiOperation({ summary: 'Lister les endroits' })
  @ApiResponse({ status: 200, description: 'Liste des endroits' })
  @ApiResponse({ status: 400, description: 'Parametres invalides' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.placesService.findAll(query);
  }

  // un endroit par id
  @Get(':id')
  @ApiOperation({ summary: 'Consulter un endroit' })
  @ApiResponse({ status: 200, description: 'Endroit trouve' })
  @ApiResponse({ status: 404, description: 'Endroit introuvable' })
  async findOne(@Param('id') id: string) {
    return this.placesService.findOne(id);
  }

  // modifie un endroit
  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un endroit' })
  @ApiResponse({ status: 200, description: 'Endroit modifie' })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 404, description: 'Endroit introuvable' })
  @ApiResponse({ status: 409, description: 'Nom deja utilise' })
  async update(
    @Param('id') id: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ) {
    return this.placesService.update(id, updatePlaceDto);
  }

  // supprime un endroit
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un endroit' })
  @ApiResponse({ status: 204, description: 'Endroit supprime' })
  @ApiResponse({ status: 404, description: 'Endroit introuvable' })
  @ApiResponse({ status: 409, description: 'Conflit suppression avec avis' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.placesService.remove(id);
  }
}
