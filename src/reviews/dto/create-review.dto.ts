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
  @ApiProperty({ example: 'Samira', minLength: 2, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)

  authorName: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)

  rating: number;

  @ApiProperty({ example: 'Calme et Wi-Fi stable.', minLength: 3, maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)

  comment: string;
}
