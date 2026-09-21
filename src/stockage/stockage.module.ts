import { Module } from '@nestjs/common';
import { StockageService } from './stockage.service';

@Module({
  providers: [StockageService],
  exports: [StockageService],
})
export class StockageModule {}
