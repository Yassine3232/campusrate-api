import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PlacesModule } from './places/places.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [DatabaseModule, PlacesModule, ReviewsModule],
})
export class AppModule {}
