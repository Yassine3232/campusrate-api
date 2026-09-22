import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlaceCategory } from '../enums/category.enum';

export class PaginationQueryDto {
  @ApiPropertyOptional({ enum: PlaceCategory, description: 'Filtre exact par catégorie' })
  @IsOptional()
  @IsEnum(PlaceCategory)

  category?: PlaceCategory;

  @ApiPropertyOptional({ example: 1, description: 'Page demandée' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)

  page: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Taille de page, maximum 50' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)

  limit: number = 10;
}
