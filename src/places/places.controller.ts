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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlaceListResponseDto } from './dto/place-list-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import { Place } from './entities/place.entity';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un nouvel endroit' })
  @ApiResponse({ status: 201, description: 'Endroit créé', type: Place })
  @ApiResponse({ status: 400, description: 'Données invalides', type: ProblemDetailsDto })

  async create(
    @Body() createPlaceDto: CreatePlaceDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Place> {
    const place = await this.placesService.create(createPlaceDto);
    res.setHeader('Location', `/api/v1/places/${place.id}`);
    return place;
  }

  @Get()
  @ApiOperation({ summary: 'Lister les endroits avec filtrage et pagination' })
  @ApiResponse({ status: 200, description: 'Liste paginée des endroits', type: PlaceListResponseDto })
  @ApiResponse({ status: 400, description: 'Paramètres invalides', type: ProblemDetailsDto })

  findAll(@Query() query: PaginationQueryDto) {
    return this.placesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un endroit' })
  @ApiParam({ name: 'id', example: 'plc_01JABC123' })
  @ApiResponse({ status: 200, description: 'Endroit trouvé', type: Place })
  @ApiResponse({ status: 404, description: 'Endroit introuvable', type: ProblemDetailsDto })

  findOne(@Param('id') id: string): Promise<Place> {
    return this.placesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier partiellement un endroit' })
  @ApiParam({ name: 'id', example: 'plc_01JABC123' })
  @ApiResponse({ status: 200, description: 'Endroit modifié', type: Place })
  @ApiResponse({ status: 400, description: 'Données invalides', type: ProblemDetailsDto })
  @ApiResponse({ status: 404, description: 'Endroit introuvable', type: ProblemDetailsDto })

  update(
    @Param('id') id: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ): Promise<Place> {
    return this.placesService.update(id, updatePlaceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un endroit' })
  @ApiParam({ name: 'id', example: 'plc_01JABC123' })
  @ApiResponse({ status: 204, description: 'Endroit supprimé' })
  @ApiResponse({ status: 404, description: 'Endroit introuvable', type: ProblemDetailsDto })
  @ApiResponse({ status: 409, description: 'Appréciations existantes', type: ProblemDetailsDto })

  remove(@Param('id') id: string): Promise<void> {
    return this.placesService.remove(id);
  }
}
