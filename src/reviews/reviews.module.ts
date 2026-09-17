import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { PlacesModule } from '../places/places.module';

@Module({
  imports: [DatabaseModule, PlacesModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
