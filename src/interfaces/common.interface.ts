import { CandleChartInterval_LT, CandleChartResult } from "binance-api-node";

export interface SwingResult {
    swingLows: CustomCandle[];
    swingHighs: CustomCandle[];
}

export interface CustomCandle extends CandleChartResult {
    index: number;
    openNum: number;
    highNum: number;
    lowNum: number;
    closeNum: number;
    openTimeString: string;
}


export interface Symbol {
    symbol: string;
}

export interface ChartResult {
    xPrice: string;
    xTime: string;
    aPrice: string;
    aTime: string;
    bPrice: CustomCandle;
    cPrice: CustomCandle;
    dPrices?: CustomCandle[];
}
export interface AnalyzeResult {
    symbol: string;
    interval: CandleChartInterval_LT;
    limit: number;
    results: ChartResult[];
}