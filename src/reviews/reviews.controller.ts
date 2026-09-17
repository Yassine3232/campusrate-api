import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import { Review } from './entities/review.entity';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('places/:placeId/reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publier une appréciation pour un endroit' })
  @ApiParam({ name: 'placeId', example: 'plc_01JABC123' })
  @ApiResponse({ status: 201, description: 'Appréciation créée avec succès', type: Review })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou attributs non autorisés',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Endroit introuvable',
    type: ProblemDetailsDto,
  })
  async create(
    @Param('placeId') placeId: string,
    @Body() createReviewDto: CreateReviewDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Review> {
    const appreciation = await this.reviewsService.creerPourEndroit(
      placeId,
      createReviewDto,
    );
    res.setHeader('Location', `/api/v1/reviews/${appreciation.id}`);
    return appreciation;
  }

  @Get('places/:placeId/reviews')
  @ApiOperation({ summary: 'Lister les appréciations associées à un endroit' })
  @ApiParam({ name: 'placeId', example: 'plc_01JABC123' })
  @ApiResponse({ status: 200, description: 'Liste des appréciations de l\'endroit', type: [Review] })
  @ApiResponse({
    status: 404,
    description: 'Endroit introuvable',
    type: ProblemDetailsDto,
  })
  findByPlace(@Param('placeId') placeId: string): Promise<Review[]> {
    return this.reviewsService.trouverParEndroit(placeId);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Consulter une appréciation par son identifiant' })
  @ApiParam({ name: 'id', example: 'rev_01JXYZ789' })
  @ApiResponse({ status: 200, description: 'Appréciation trouvée', type: Review })
  @ApiResponse({
    status: 404,
    description: 'Appréciation introuvable',
    type: ProblemDetailsDto,
  })
  findOne(@Param('id') id: string): Promise<Review> {
    return this.reviewsService.findOne(id);
  }

  @Patch('reviews/:id')
  @ApiOperation({ summary: 'Modifier partiellement une appréciation' })
  @ApiParam({ name: 'id', example: 'rev_01JXYZ789' })
  @ApiResponse({ status: 200, description: 'Appréciation modifiée', type: Review })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Appréciation introuvable',
    type: ProblemDetailsDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une appréciation' })
  @ApiParam({ name: 'id', example: 'rev_01JXYZ789' })
  @ApiResponse({ status: 204, description: 'Appréciation supprimée avec succès' })
  @ApiResponse({
    status: 404,
    description: 'Appréciation introuvable',
    type: ProblemDetailsDto,
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.reviewsService.remove(id);
  }
}
