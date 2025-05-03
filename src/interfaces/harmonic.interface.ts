// src/interfaces/harmonic.interface.ts
import { CustomCandle, ChartResult } from './common.interface';
import { CandleChartInterval_LT } from 'binance-api-node';

/**
 * Interface cơ bản cho các mô hình Harmonic
 */
export interface HarmonicPattern {
  /**
   * Tên mô hình (CYPHER, BAT, GARTLEY, v.v.)
   */
  name: string;
  
  /**
   * Loại mô hình (BULLISH hoặc BEARISH)
   */
  type: string;
  
  /**
   * Phương thức tìm mô hình trong dữ liệu nến
   */
  findPattern(candles: CustomCandle[]): ChartResult[];
}

/**
 * Cấu hình các mức Fibonacci cho mỗi mô hình
 */
export interface PatternConfig {
  /**
   * Mức Fibonacci tối thiểu cho điểm B
   */
  B_MIN: number;
  
  /**
   * Mức Fibonacci tối đa cho điểm B
   */
  B_MAX: number;
  
  /**
   * Mức Fibonacci tối thiểu cho điểm C
   */
  C_MIN: number;
  
  /**
   * Mức Fibonacci tối đa cho điểm C
   */
  C_MAX: number;
  
  /**
   * Mức Fibonacci tối thiểu cho điểm D
   */
  D_MIN: number;
  
  /**
   * Mức Fibonacci tối đa cho điểm D
   */
  D_MAX: number;
  
  /**
   * Mức Fibonacci tối thiểu cho tỉ lệ BC-D (nếu có)
   */
  D_BC_MIN?: number;
  
  /**
   * Mức Fibonacci tối đa cho tỉ lệ BC-D (nếu có)
   */
  D_BC_MAX?: number;
  
  /**
   * Mức Fibonacci tối thiểu cho tỉ lệ AB-C (nếu có)
   */
  C_AB_MIN?: number;
  
  /**
   * Mức Fibonacci tối đa cho tỉ lệ AB-C (nếu có)
   */
  C_AB_MAX?: number;
}

/**
 * Kết quả phân tích mô hình Harmonic
 */
export interface HarmonicResult {
  /**
   * Cặp tiền được phân tích
   */
  symbol: string;
  
  /**
   * Khung thời gian phân tích
   */
  interval: CandleChartInterval_LT;
  
  /**
   * Số lượng nến được phân tích
   */
  limit: number;
  
  /**
   * Các mô hình được tìm thấy, phân loại theo loại mô hình
   */
  patterns: {
    [key: string]: ChartResult[];
  }
}
