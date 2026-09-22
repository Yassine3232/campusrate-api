// dto pour creer un endroit
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
  @ApiProperty({ example: 'Bibliothèque principale' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Espace calme avec prises.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  description: string;

  @ApiProperty({ enum: PlaceCategory, example: PlaceCategory.STUDY_SPACE })
  @IsEnum(PlaceCategory)
  category: PlaceCategory;

  @ApiProperty({ example: 'Pavillon A, local A-210' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  address: string;

  @ApiPropertyOptional({ example: ['WIFI', 'POWER_OUTLETS'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  services?: string[] = [];

  @ApiPropertyOptional({ enum: PlaceStatus })
  @IsOptional()
  @IsEnum(PlaceStatus)
  status?: PlaceStatus = PlaceStatus.ACTIVE;
}
