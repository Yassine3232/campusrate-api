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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Place } from './entities/place.entity';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  // ajoute un endroit
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creation d endroit' })
  @ApiResponse({ status: 201, description: 'Endroit cree', type: Place })
  async create(
    @Body() createPlaceDto: CreatePlaceDto,
    @Res({ passthrough: true }) res: Response, // pour mettre le header location sans casser le retour auto
  ) {
    const place = await this.placesService.create(createPlaceDto);
    res.setHeader('Location', `/api/v1/places/${place.id}`);
    return place;
  }

  // liste les endroits avec filtres
  @Get()
  @ApiOperation({ summary: 'Lister les endroits' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.placesService.findAll(query);
  }

  // un endroit par id
  @Get(':id')
  @ApiOperation({ summary: 'Consulter un endroit' })
  findOne(@Param('id') id: string): Promise<Place> {
    return this.placesService.findOne(id);
  }

  // modifie un endroit
  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un endroit' })
  update(
    @Param('id') id: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ): Promise<Place> {
    return this.placesService.update(id, updatePlaceDto);
  }

  // supprime un endroit
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un endroit' })
  remove(@Param('id') id: string): Promise<void> {
    return this.placesService.remove(id);
  }
}
