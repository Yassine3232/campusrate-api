// dto pour creer un avis
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'Samira' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  authorName: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Calme et Wi-Fi stable.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  comment: string;
}
