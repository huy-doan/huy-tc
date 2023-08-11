import { CandleChartInterval_LT, CandleChartResult } from "binance-api-node";

export interface SwingResult {
    swingLows: Pointer[];
    swingHighs: Pointer[];
}

export interface Pointer extends CandleChartResult {
    index: number;
    price: string;
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
    bPrices: Pointer[];
    cPrices: Pointer[];
    dPrices?: Pointer[];
}
export interface AnalyzeResult {
    symbol: string;
    interval: CandleChartInterval_LT;
    limit: number;
    results: ChartResult[];
}