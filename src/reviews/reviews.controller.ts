// controleur reviews
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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // cree un avis pour un endroit
  @Post('places/:placeId/reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publier une appreciation' })
  @ApiResponse({ status: 201, description: 'Avis cree' })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 404, description: 'Endroit introuvable' })
  async create(
    @Param('placeId') placeId: string,
    @Body() createReviewDto: CreateReviewDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const appreciation = await this.reviewsService.creerPourEndroit(
      placeId,
      createReviewDto,
    );
    res.setHeader('Location', `/api/v1/reviews/${(appreciation as any).id || (appreciation as any)._id}`);
    return appreciation;
  }

  // liste les avis d un endroit
  @Get('places/:placeId/reviews')
  @ApiOperation({ summary: 'Lister les avis' })
  @ApiResponse({ status: 200, description: 'Liste des avis' })
  @ApiResponse({ status: 404, description: 'Endroit introuvable' })
  async findyPlace(@Param('placeId') placeId: string) {
    return this.reviewsService.trouverParEndroit(placeId);
  }

  // trouve un avis par id
  @Get('reviews/:id')
  @ApiOperation({ summary: 'Consulter un avis' })
  @ApiResponse({ status: 200, description: 'Avis trouve' })
  @ApiResponse({ status: 404, description: 'Avis introuvable' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  // modifie un avis
  @Patch('reviews/:id')
  @ApiOperation({ summary: 'Modifier un avis' })
  @ApiResponse({ status: 200, description: 'Avis modifie' })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 404, description: 'Avis introuvable' })
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  // supprime un avis
  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un avis' })
  @ApiResponse({ status: 204, description: 'Avis supprime' })
  @ApiResponse({ status: 404, description: 'Avis introuvable' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.reviewsService.remove(id);
  }
}
