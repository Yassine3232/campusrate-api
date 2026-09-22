import { ApiProperty } from '@nestjs/swagger';

export class ProblemDetailsDto {
  @ApiProperty({ example: 'about:blank' })

  type: string;

  @ApiProperty({ example: 'Bad Request' })

  title: string;

  @ApiProperty({ example: 400 })

  status: number;

  @ApiProperty({ example: 'Données invalides' })

  detail: string;

  @ApiProperty({ example: '/api/v1/places' })

  instance: string;
}
