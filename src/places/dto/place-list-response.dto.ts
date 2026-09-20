import { ApiProperty } from '@nestjs/swagger';
import { Place } from '../entities/place.entity';

export class PaginationDto {
  @ApiProperty({ description: 'Page retournée', example: 1 })
  page: number;

  @ApiProperty({ description: 'Nombre d éléments par page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Nombre total d éléments filtrés', example: 42 })
  totalItems: number;

  @ApiProperty({ description: 'Nombre total de pages', example: 5 })
  totalPages: number;
}

export class PlaceListResponseDto {
  @ApiProperty({ type: [Place] })
  data: Place[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
