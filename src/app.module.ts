import { Module } from '@nestjs/common';
import { StockageModule } from './stockage/stockage.module';
import { PlacesModule } from './places/places.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [StockageModule, PlacesModule, ReviewsModule],
})
export class AppModule {}
