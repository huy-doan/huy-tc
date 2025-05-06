import { Module } from '@nestjs/common';
import { BinanceController } from './binance.controller';
import { BinanceService } from './binance.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [BinanceController],
  providers: [BinanceService,],
  exports: [BinanceService,], // Export services để sử dụng trong PointCronService
})
export class BinanceModule {}
