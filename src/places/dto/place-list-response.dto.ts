import { ApiProperty } from '@nestjs/swagger';
import { Place } from '../entities/place.entity';

export class PaginationDto {
  @ApiProperty({ example: 1 })

  page: number;

  @ApiProperty({ example: 10 })

  limit: number;

  @ApiProperty({ example: 42 })

  totalItems: number;

  @ApiProperty({ example: 5 })

  totalPages: number;
}

export class PlaceListResponseDto {
  @ApiProperty({ type: [Place] })

  data: Place[];

  @ApiProperty({ type: PaginationDto })

  pagination: PaginationDto;
}
