import { Module } from '@nestjs/common';
import { StockageModule } from '../stockage/stockage.module';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { PlacesModule } from '../places/places.module';

@Module({
  imports: [StockageModule, PlacesModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
