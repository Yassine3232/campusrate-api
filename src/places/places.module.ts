import { Module } from '@nestjs/common';
import { StockageModule } from '../stockage/stockage.module';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';

@Module({
  imports: [StockageModule],
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [PlacesService],
})
export class PlacesModule {}
