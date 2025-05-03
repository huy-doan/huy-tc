// src/binances/binance.service.ts
import { Injectable } from '@nestjs/common';
import binanceApiNode, { Binance, CandleChartInterval_LT, CandleChartResult, CandlesOptions } from 'binance-api-node';
import { env } from '~config/env.config';
import Constants from '~constants/Constants';
import { timestampToString } from '~helpers/time.helper';
import { AnalyzeResult, ChartResult, CustomCandle, SwingResult, Symbol } from '~interfaces/common.interface';
import { SwingDetector } from '~libs/harmonic/SwingDetector';
import { HarmonicPatternFactory } from '~libs/harmonic/patterns/HarmonicPatternFactory';
import { HARMONICS } from '~config/harmonics.config';

@Injectable()
export class BinanceService {
    private readonly binance: Binance;

    constructor() {
      this.binance = binanceApiNode({
        apiKey: env.BINANCE.KEY,
        apiSecret: env.BINANCE.SECRET
      });
    }
  
    /**
     * Lấy tất cả các symbol từ Binance Futures
     */
    async getSymbols(): Promise<Symbol[]>
    {
        try {
            const futuresExchangeInfo = await this.binance.futuresExchangeInfo();
            const { symbols } = futuresExchangeInfo;
            return symbols.map(item => ({ symbol: item.symbol }));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Lấy dữ liệu nến từ Binance Futures API
     */
    async getFuturesCandles(candlesOptions: CandlesOptions): Promise<CustomCandle[]>
    {
        try {
            const futuresCandles = await this.binance.futuresCandles(candlesOptions);

            let candles: CustomCandle[] = [];
            for (const [index, candle] of Object.entries(futuresCandles)) {
                candles.push({
                    index: Number(index), 
                    openNum: parseFloat(candle.open),
                    highNum: parseFloat(candle.high),
                    lowNum: parseFloat(candle.low),
                    closeNum: parseFloat(candle.close),
                    openTimeString: timestampToString(candle.openTime),
                    ...candle
                });
            }

            return candles;
        } catch (error) {
            console.error(`Error fetching candles for ${candlesOptions.symbol}: ${error.message}`);
            return [] as CustomCandle[];
        }
    }

    /**
     * Phân tích và tìm kiếm các mô hình hài hòa
     */
    async analyzeHarmonicPatterns(
        interval: CandleChartInterval_LT = '1h', 
        limit: number = 500,
        patternTypes: string[] = ['CYPHER', 'BAT', 'GARTLEY', 'BUTTERFLY', 'CRAB', 'SHARK']
    ): Promise<AnalyzeResult[]> {
        const results: AnalyzeResult[] = [];
        
        try {
            // Lấy danh sách các symbol
            const symbols = await this.getSymbols();
            
            // Duyệt qua từng symbol
            for (const symbolItem of symbols) {
                const { symbol } = symbolItem;
                console.log(`Analyzing symbol: ${symbol}`);
                // Lấy dữ liệu nến
                const candles: CustomCandle[] = await this.getFuturesCandles({
                    symbol,
                    interval,
                    limit,
                });
                
                if (candles.length === 0) {
                    continue;
                }
                
                // Tìm các swing points
                const swingResult = SwingDetector.findSwingLowsAndHighs(candles);
                
                // Lọc các swing points có ý nghĩa
                const filteredSwings = SwingDetector.filterSignificantSwings(swingResult, candles);
                let chartResults: ChartResult[] = [];
                
                // Phân tích từng loại mô hình
                for (const patternType of patternTypes) {
                    try {
                        // Sử dụng Factory để tạo đối tượng mô hình
                        const patternDetector = HarmonicPatternFactory.createPattern(patternType);
                        
                        // Phát hiện mô hình
                        const patterns = patternDetector.detectPattern(candles, swingResult);
                        
                        // Thêm vào kết quả
                        chartResults = [...chartResults, ...patterns];
                    } catch (error) {
                        console.error(`Error analyzing ${patternType} pattern: ${error.message}`);
                    }
                }
                
                // Nếu tìm thấy mô hình, thêm vào kết quả
                if (chartResults.length > 0) {
                    results.push({
                        symbol,
                        interval,
                        limit,
                        results: chartResults
                    });
                }
            }
        } catch (error) {
            console.error(`Error in harmonic pattern analysis: ${error.message}`);
        }
        
        return results;
    }
    
    /**
     * API endpoint cụ thể cho mô hình Cypher
     */
    async harmonicCypherPattern(
        interval: CandleChartInterval_LT = '1h', 
        limit: number = 500
    ): Promise<AnalyzeResult[]> {
        return this.analyzeHarmonicPatterns(interval, limit, ['CYPHER']);
    }
    
    /**
     * API endpoint cho mô hình BAT
     */
    async harmonicBatPattern(
        interval: CandleChartInterval_LT = '1h', 
        limit: number = 500
    ): Promise<AnalyzeResult[]> {
        return this.analyzeHarmonicPatterns(interval, limit, ['BAT']);
    }
    
    /**
     * API endpoint cho mô hình Gartley
     */
    async harmonicGartleyPattern(
        interval: CandleChartInterval_LT = '1h', 
        limit: number = 500
    ): Promise<AnalyzeResult[]> {
        return this.analyzeHarmonicPatterns(interval, limit, ['GARTLEY']);
    }
    
    /**
     * API endpoint cho mô hình Butterfly
     */
    async harmonicButterflyPattern(
        interval: CandleChartInterval_LT = '1h', 
        limit: number = 500
    ): Promise<AnalyzeResult[]> {
        return this.analyzeHarmonicPatterns(interval, limit, ['BUTTERFLY']);
    }
    
    /**
     * API endpoint cho mô hình Crab
     */
    async harmonicCrabPattern(
        interval: CandleChartInterval_LT = '1h', 
        limit: number = 500
    ): Promise<AnalyzeResult[]> {
        return this.analyzeHarmonicPatterns(interval, limit, ['CRAB']);
    }
    
    /**
     * API endpoint cho mô hình Shark
     */
    async harmonicSharkPattern(
        interval: CandleChartInterval_LT = '1h', 
        limit: number = 500
    ): Promise<AnalyzeResult[]> {
        return this.analyzeHarmonicPatterns(interval, limit, ['SHARK']);
    }
}
