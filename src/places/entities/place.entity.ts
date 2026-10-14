import { ApiProperty } from '@nestjs/swagger';
import { PlaceCategory } from '../../common/enums/category.enum';
import { PlaceStatus } from '../../common/enums/status.enum';

export class Place {
  @ApiProperty({ example: 'plc_01JABC123' })

  id: string;

  @ApiProperty({ example: 'Bibliothèque principale' })

  name: string;

  @ApiProperty({ example: 'Espace calme avec prises.' })

  description: string;

  @ApiProperty({ enum: PlaceCategory, example: PlaceCategory.STUDY_SPACE })

  category: PlaceCategory;

  @ApiProperty({ example: 'Pavillon A, local A-210' })

  address: string;

  @ApiProperty({ example: ['WIFI', 'POWER_OUTLETS'] })

  services: string[];

  @ApiProperty({ enum: PlaceStatus, example: PlaceStatus.ACTIVE })

  status: PlaceStatus;

  @ApiProperty({ example: 4.25, nullable: true })

  averageRating: number | null;

  @ApiProperty({ example: 12 })

  reviewCount: number;

  @ApiProperty({ example: '2026-09-01T12:00:00.000Z' })

  createdAt: string;

  @ApiProperty({ example: '2026-09-01T12:00:00.000Z' })

  updatedAt: string;
}
