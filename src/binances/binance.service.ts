// src/binances/binance.service.ts
import { Injectable } from '@nestjs/common';
import binanceApiNode, { Binance, CandleChartInterval_LT, CandlesOptions } from 'binance-api-node';
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
      console.error('Lỗi khi lấy danh sách cặp tiền:', error);
      throw error;
    }
  }

  /**
   * Lấy dữ liệu nến (candles) từ Binance Futures
   */
  async getFuturesCandles(candlesOptions: CandlesOptions): Promise<CustomCandle[]> {
    try {
      const futuresCandles = await this.binance.futuresCandles(candlesOptions);

      return futuresCandles.map((candle, index) => ({
        index,
        openNum: parseFloat(candle.open),
        highNum: parseFloat(candle.high),
        lowNum: parseFloat(candle.low),
        closeNum: parseFloat(candle.close),
        openTimeString: timestampToString(candle.openTime),
        ...candle
      }));
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu nến:', error);
      return [];
    }
  }

  /**
   * Tìm các mô hình Harmonic
   */
  async harmonicCypherPattern(
    interval: CandleChartInterval_LT = '1h', 
    limit: number = 500
  ): Promise<AnalyzeResult[]> {
    const results: AnalyzeResult[] = [];
    
    try {
      const symbols = await this.getSymbols();
      
      // Tạo các pattern cần phân tích
      const patterns = [
        HarmonicPatternFactory.createPattern(HARMONIC_PATTERN.CYPHER, PATTERN_TYPE.BULLISH),
        HarmonicPatternFactory.createPattern(HARMONIC_PATTERN.CYPHER, PATTERN_TYPE.BEARISH),
        HarmonicPatternFactory.createPattern(HARMONIC_PATTERN.BAT, PATTERN_TYPE.BULLISH),
        HarmonicPatternFactory.createPattern(HARMONIC_PATTERN.BAT, PATTERN_TYPE.BEARISH)
      ].filter(pattern => pattern !== null); // Lọc bỏ pattern null (nếu có)
      
      for (const { symbol } of symbols) {
        const candles = await this.getFuturesCandles({ symbol, interval, limit });
        
        if (candles.length === 0) continue;
        
        let chartResults: ChartResult[] = [];
        
        // Tìm tất cả các mô hình
        for (const pattern of patterns) {
          const patternResults = pattern.findPattern(candles);
          chartResults.push(...patternResults);
        }
        
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
      console.error('Lỗi khi tìm mô hình Harmonic:', error);
    }
    
    return results;
  }
}
