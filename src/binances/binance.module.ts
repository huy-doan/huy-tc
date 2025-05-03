import { Module } from '@nestjs/common';
import { BinanceController } from './binance.controller';
import { BinanceService } from './binance.service';
import { OldBinanceService } from './old-binance.service';

@Module({
  controllers: [BinanceController],
  providers: [BinanceService, OldBinanceService],
})
export class BinanceModule {}
