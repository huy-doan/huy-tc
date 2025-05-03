// src/binances/binance.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { AnalyzeResult } from '~interfaces/common.interface';
import { HarmonicResult } from '~interfaces/harmonic.interface';
import { CandleChartInterval_LT } from 'binance-api-node';

@Controller('harmonics')
export class BinanceController {
  constructor(private readonly binanceService: BinanceService) {}

  /**
   * Endpoint để tìm mô hình Cypher (deprecated)
   */
  @Get('/cypher')
  async cypher(
    @Query('interval') interval: CandleChartInterval_LT, 
    @Query('limit') limit: number
  ): Promise<AnalyzeResult[]> {
    return this.binanceService.harmonicCypherPattern(interval, limit);
  }

  /**
   * Endpoint để tìm tất cả các mô hình Harmonic trên tất cả các cặp tiền
   */
  @Get('/patterns')
  async findAllPatterns(
    @Query('interval') interval: CandleChartInterval_LT,
    @Query('limit') limit: number
  ): Promise<HarmonicResult[]> {
    return this.binanceService.findAllHarmonicPatterns(interval, limit);
  }
}
