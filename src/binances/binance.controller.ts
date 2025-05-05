// src/binances/binance.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { OldBinanceService } from './old-binance.service';
import { AnalyzeResult } from '~interfaces/common.interface';
import { CandleChartInterval_LT } from 'binance-api-node';

@Controller('harmonics')
export class BinanceController {
    constructor(
        private readonly binanceService: BinanceService,
        private readonly oldBinanceService: OldBinanceService
    ) {}

    @Get('/old-cypher')
    async oldCypher(
        @Query('interval') interval: CandleChartInterval_LT, 
        @Query('limit') limit: number
    ): Promise<AnalyzeResult[]> {
        return this.oldBinanceService.harmonicCypherPattern(interval, limit);
    }

    @Get('/cypher')
    async cypher(
        @Query('interval') interval: CandleChartInterval_LT, 
        @Query('limit') limit: number
    ): Promise<AnalyzeResult[]> {
        return this.binanceService.harmonicCypherPattern(interval, limit);
    }
    
    @Get('/bat')
    async bat(
        @Query('interval') interval: CandleChartInterval_LT, 
        @Query('limit') limit: number
    ): Promise<AnalyzeResult[]> {
        return this.binanceService.harmonicBatPattern(interval, limit);
    }
    
    @Get('/gartley')
    async gartley(
        @Query('interval') interval: CandleChartInterval_LT, 
        @Query('limit') limit: number
    ): Promise<AnalyzeResult[]> {
        return this.binanceService.harmonicGartleyPattern(interval, limit);
    }
    
    @Get('/butterfly')
    async butterfly(
        @Query('interval') interval: CandleChartInterval_LT, 
        @Query('limit') limit: number
    ): Promise<AnalyzeResult[]> {
        return this.binanceService.harmonicButterflyPattern(interval, limit);
    }
    
    @Get('/crab')
    async crab(
        @Query('interval') interval: CandleChartInterval_LT, 
        @Query('limit') limit: number
    ): Promise<AnalyzeResult[]> {
        return this.binanceService.harmonicCrabPattern(interval, limit);
    }
    
    @Get('/shark')
    async shark(
        @Query('interval') interval: CandleChartInterval_LT, 
        @Query('limit') limit: number
    ): Promise<AnalyzeResult[]> {
        return this.binanceService.harmonicSharkPattern(interval, limit);
    }
    
    @Get('/all')
    async allPatterns(
        @Query('interval') interval: CandleChartInterval_LT, 
        @Query('limit') limit: number
    ): Promise<AnalyzeResult[]> {
        return this.binanceService.analyzeHarmonicPatterns(interval, limit);
    }
}
