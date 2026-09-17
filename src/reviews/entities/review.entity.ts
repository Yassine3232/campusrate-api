import { ApiProperty } from '@nestjs/swagger';

export class Review {
  @ApiProperty({ example: 'rev_01JXYZ789' })
  id: string;

  @ApiProperty({ example: 'plc_01JABC123' })
  placeId: string;

  @ApiProperty({ example: 'Samira' })
  authorName: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ example: 'Calme et Wi-Fi stable.' })
  comment: string;

  @ApiProperty({ example: '2026-09-01T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-01T12:00:00.000Z' })
  updatedAt: string;
}
