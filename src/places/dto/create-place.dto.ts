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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlaceCategory } from '../../common/enums/category.enum';
import { PlaceStatus } from '../../common/enums/status.enum';

export class CreatePlaceDto {
  @ApiProperty({ example: 'Bibliothèque principale', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)

  name: string;

  @ApiProperty({ example: 'Espace calme avec prises.', minLength: 5, maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)

  description: string;

  @ApiProperty({ enum: PlaceCategory, example: PlaceCategory.STUDY_SPACE })
  @IsEnum(PlaceCategory)

  category: PlaceCategory;

  @ApiProperty({ example: 'Pavillon A, local A-210', minLength: 3, maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)

  address: string;

  @ApiPropertyOptional({
    description: 'Services offerts, vide par défaut et sans doublons',
    example: ['WIFI', 'POWER_OUTLETS'],
    type: [String],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()

  services?: string[] = [];

  @ApiPropertyOptional({ enum: PlaceStatus, example: PlaceStatus.ACTIVE, default: PlaceStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PlaceStatus)

  status?: PlaceStatus = PlaceStatus.ACTIVE;
}
