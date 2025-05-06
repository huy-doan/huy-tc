// src/binances/binance.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { AnalyzeResult } from '~interfaces/common.interface';
import { CandleChartInterval_LT } from 'binance-api-node';

@Controller('harmonics')
export class BinanceController {
    constructor(
        private readonly binanceService: BinanceService,
    ) {}

    @Get('/all')
    async oldCypher(
        @Query('interval') interval: CandleChartInterval_LT, 
        @Query('limit') limit: number
    ): Promise<AnalyzeResult[]> {
        return this.binanceService.harmonicCypherPattern(interval, limit);
    }
}
