import { Controller, Get, Query } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { AnalyzeResult } from '~interface/common.interface';
import { CandleChartInterval_LT } from 'binance-api-node';

@Controller('harmonics')
export class BinanceController {
    constructor(private readonly binanceService: BinanceService) {}

    @Get('/cypher')
    async cypher(@Query('interval') interval: CandleChartInterval_LT, @Query('limit') limit: number): Promise<any[]> {
        return this.binanceService.harmonicCypherPattern(interval, limit);
    }
}
