import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ArrayUnique,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlaceCategory } from '../../common/enums/category.enum';
import { PlaceStatus } from '../../common/enums/status.enum';

export class UpdatePlaceDto {
  @ApiPropertyOptional({
    description: 'Nom de l endroit',
    example: 'Bibliothèque des sciences',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Description de l endroit',
    example: 'Espace rénové et calme.',
    minLength: 5,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Catégorie autorisée de l endroit',
    enum: PlaceCategory,
    example: PlaceCategory.LIBRARY,
  })
  @IsOptional()
  @IsEnum(PlaceCategory)
  category?: PlaceCategory;

  @ApiPropertyOptional({
    description: 'Emplacement compréhensible de l endroit',
    example: 'Pavillon B, local B-101',
    minLength: 3,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({
    description:
      'Services offerts, tableau de chaînes sans doublons',
    example: ['WIFI', 'SILENT_ZONE'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  services?: string[];

  @ApiPropertyOptional({
    description: 'État de l endroit, valeur par défaut : ACTIVE',
    enum: PlaceStatus,
    example: PlaceStatus.TEMPORARILY_CLOSED,
  })
  @IsOptional()
  @IsEnum(PlaceStatus)
  status?: PlaceStatus;
}
