import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Point } from './entities/point.entity';
import { PointTF } from './entities/point-tf.entity';
import { PointService } from './point.service';
import { PointCronService } from './point-cron.service';
import { BinanceModule } from '../binances/binance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Point, PointTF]),
    BinanceModule,
  ],
  providers: [PointService, PointCronService],
  exports: [PointService],
})
export class PointModule {}
