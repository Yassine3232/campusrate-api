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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // cree un avis pour un endroit
  @Post('places/:placeId/reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publier une appreciation' })
  @ApiResponse({ status: 201, description: 'Avis cree', type: Review })
  async create(
    @Param('placeId') placeId: string,
    @Body() createReviewDto: CreateReviewDto,
    @Res({ passthrough: true }) res: Response, // pour mettre le header location sans casser le retour auto
  ) {
    const appreciation = await this.reviewsService.creerPourEndroit(
      placeId,
      createReviewDto,
    );
    res.setHeader('Location', `/api/v1/reviews/${appreciation.id}`);
    return appreciation;
  }

  // liste les avis d un endroit
  @Get('places/:placeId/reviews')
  @ApiOperation({ summary: 'Lister les avis' })
  findyPlace(@Param('placeId') placeId: string): Promise<Review[]> {
    return this.reviewsService.trouverParEndroit(placeId);
  }

  // trouve un avis par id
  @Get('reviews/:id')
  @ApiOperation({ summary: 'Consulter un avis' })
  findOne(@Param('id') id: string): Promise<Review> {
    return this.reviewsService.findOne(id);
  }

  // modifie un avis
  @Patch('reviews/:id')
  @ApiOperation({ summary: 'Modifier un avis' })
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.update(id, updateReviewDto);
  }

  // supprime un avis
  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un avis' })
  remove(@Param('id') id: string): Promise<void> {
    return this.reviewsService.remove(id);
  }
}
