// src/binances/binance.service.ts
import { Injectable } from '@nestjs/common';
import binanceApiNode, { Binance, CandleChartInterval_LT, CandleChartResult, CandlesOptions } from 'binance-api-node';
import { env } from '~config/env.config';
import { timestampToString } from '~helpers/time.helper';
import { AnalyzeResult, ChartResult, CustomCandle, Symbol } from '~interfaces/common.interface';
import { HarmonicResult } from '~interfaces/harmonic.interface';
import { HarmonicPatternFactory } from '~libs/harmonic/HarmonicPatternFactory';
import { HARMONIC_PATTERN, PATTERN_TYPE } from '~config/harmonic.constants';

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
   * Lấy danh sách các cặp tiền từ Binance
   */
  async getSymbols(): Promise<Symbol[]> {
    try {
      const futuresExchangeInfo = await this.binance.futuresExchangeInfo();
      const { symbols } = futuresExchangeInfo;
      return symbols.map(item => ({ symbol: item.symbol }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy dữ liệu nến (candles) từ Binance Futures
   */
  async getFuturesCandles(candlesOptions: CandlesOptions): Promise<CustomCandle[]> {
    try {
      const futuresCandles = await this.binance.futuresCandles(candlesOptions);

      let pointers: CustomCandle[] = [];
      for (const [index, candle] of Object.entries(futuresCandles)) {
        pointers.push({
          index: Number(index), 
          openNum: parseFloat(candle.open),
          highNum: parseFloat(candle.high),
          lowNum: parseFloat(candle.low),
          closeNum: parseFloat(candle.close),
          openTimeString: timestampToString(candle.openTime),
          ...candle
        });
      }

      return pointers;
    } catch (error) {
      return [] as CustomCandle[];
    }
  }

  /**
   * Tìm tất cả các mô hình Harmonic trên tất cả các cặp tiền
   */
  async findAllHarmonicPatterns(
    interval: CandleChartInterval_LT = '1h', 
    limit: number = 500
  ): Promise<HarmonicResult[]> {
    const results: HarmonicResult[] = [];
    
    try {
      const symbols = await this.getSymbols();
      
      // Lấy tất cả các mô hình harmonic cần phân tích
      const patterns = HarmonicPatternFactory.createAllPatterns();
      
      for (const symbolItem of symbols) {
        const { symbol } = symbolItem;
        
        // Lấy dữ liệu nến
        const futuresCandles: CustomCandle[] = await this.getFuturesCandles({
          symbol,
          interval,
          limit,
        });
        
        if (futuresCandles.length === 0) {
          continue;
        }
        
        // Kết quả cho mỗi cặp tiền
        const patternResults: { [key: string]: ChartResult[] } = {};
        
        // Phân tích mỗi mô hình
        for (const pattern of patterns) {
          const patternResults = pattern.findPattern(futuresCandles);
          
          if (patternResults.length > 0) {
            const key = `${pattern.type}_${pattern.name}`;
            patternResults[key] = patternResults;
          }
        }
        
        // Nếu tìm thấy bất kỳ mô hình nào, thêm vào kết quả
        const hasPatterns = Object.keys(patternResults).length > 0;
        if (hasPatterns) {
          results.push({
            symbol,
            interval,
            limit,
            patterns: patternResults
          });
        }
      }
      
    } catch (error) {
      console.error('Error finding harmonic patterns:', error);
    }
    
    return results;
  }

  /**
   * Tìm các mô hình Cypher
   * @deprecated Sử dụng findAllHarmonicPatterns thay thế
   */
  async harmonicCypherPattern(
    interval: CandleChartInterval_LT = '1h', 
    limit: number = 500
  ): Promise<AnalyzeResult[]> {
    let results: AnalyzeResult[] = [];
    
    try {
      const symbols = await this.getSymbols();
      
      const bullishCypher = HarmonicPatternFactory.createPattern(
        HARMONIC_PATTERN.CYPHER, 
        PATTERN_TYPE.BULLISH
      );
      
      const bearishCypher = HarmonicPatternFactory.createPattern(
        HARMONIC_PATTERN.CYPHER, 
        PATTERN_TYPE.BEARISH
      );
      
      for (const symbolItem of symbols) {
        const { symbol } = symbolItem;
        
        const futuresCandles: CustomCandle[] = await this.getFuturesCandles({
          symbol,
          interval,
          limit,
        });
        
        if (futuresCandles.length === 0) {
          continue;
        }
        
        let chartResults: ChartResult[] = [];
        
        // Tìm mô hình Cypher Bullish
        if (bullishCypher) {
          const bullishResults = bullishCypher.findPattern(futuresCandles);
          chartResults = [...chartResults, ...bullishResults];
        }
        
        // Tìm mô hình Cypher Bearish
        if (bearishCypher) {
          const bearishResults = bearishCypher.findPattern(futuresCandles);
          chartResults = [...chartResults, ...bearishResults];
        }
        
        if (chartResults.length > 0) {
          const analyzeResult: AnalyzeResult = {
            symbol,
            interval,
            limit,
            results: chartResults
          };
          
          results.push(analyzeResult);
        }
      }
      
    } catch (error) {
      console.error('Error finding Cypher patterns:', error);
    }
    
    return results;
  }
}
