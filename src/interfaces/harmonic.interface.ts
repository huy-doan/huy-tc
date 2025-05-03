// src/interfaces/harmonic.interface.ts
import { CustomCandle, ChartResult } from './common.interface';
import { CandleChartInterval_LT } from 'binance-api-node';

export interface HarmonicPattern {
  name: string;
  type: string;
  findPattern(candles: CustomCandle[]): ChartResult[];
}

export interface PatternConfig {
  B_MIN: number;
  B_MAX: number;
  C_MIN: number;
  C_MAX: number;
  D_MIN: number;
  D_MAX: number;
  D_BC_MIN?: number;
  D_BC_MAX?: number;
  C_AB_MIN?: number;
  C_AB_MAX?: number;
}

export interface HarmonicResult {
  symbol: string;
  interval: CandleChartInterval_LT;
  limit: number;
  patterns: {
    [key: string]: ChartResult[];
  }
}
