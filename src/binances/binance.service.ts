import { Injectable } from '@nestjs/common';
import binanceApiNode, { Binance, Candle, CandleChartInterval_LT, CandleChartResult, CandlesOptions } from 'binance-api-node';
import { CONSTANT } from '~config/const.config';
import { downFibonacciRetracement, upFibonacciRetracement } from '~helper/formula.helper';
import { timestampToString } from '~helper/time.helper';
import { AnalyzeResult, ChartResult, Pointer, SwingResult, Symbol } from '~interface/common.interface';

@Injectable()
export class BinanceService {
    private readonly binance: Binance;

    constructor() {
      this.binance = binanceApiNode({
        apiKey: 'env.BINANCE.KEY',
        apiSecret: 'env.BINANCE.SECRET'
      });
    }
  
    // Example method to get the current Bitcoin (BTC) price
    async getBitcoinsPrice(): Promise<CandleChartResult[]> {
        const timeRanges = ['15m', '1h', '2h', '4h', '1d'];
        let funces = [];
        try {
            let i = 1;
            for (const time of timeRanges) {
                const coin = this.binance.futuresCandles({
                    symbol: 'BTCUSDT',
                    interval: time as any,
                    limit: 10,
                    endTime: 1597138010000
                })
                funces.push(coin);
                i++;
            }
            const res = await Promise.all(funces);

            return res;
        } catch (error) {
            throw new Error('Failed to fetch Bitcoin price from Binance API');
        }
    }

    async getSymbols(): Promise<Symbol[]>
    {
        try {
            const futuresExchangeInfo = await this.binance.futuresExchangeInfo();
            const { symbols } = futuresExchangeInfo;
            console.log(symbols.length);
            return symbols.map(item => ({ symbol: item.symbol }));
        } catch (error) {
            throw error;
        }
    }

    // Example method to get the current Bitcoin (BTC) price
    async harmonicCypherPattern(interval: CandleChartInterval_LT = '1h', limit: number = 500): Promise<AnalyzeResult[]>
    {
        let res: AnalyzeResult[] = [];
        try {
            const symbols = await this.getSymbols();
            for (const symbolItem of symbols) {
                const { symbol } = symbolItem;
                const chartResult: ChartResult[] = await this.calculatorCypherPattern(symbol, interval, limit);
                console.log(chartResult);
                if (chartResult.length > 0) {
                    const analyzeResult: AnalyzeResult = {
                        symbol,
                        interval,
                        limit,
                        results: chartResult
                    }
                    res.push(analyzeResult);
                }
            }
            
        } catch (error) {
            throw error;
        }
        

        return res;
    }

    async getFuturesCandles(candlesOptions: CandlesOptions): Promise<Pointer[]>
    {
        try {
            const futuresCandles = await this.binance.futuresCandles(candlesOptions);

            let pointers: Pointer[] = [];
            for (const [index, candle] of Object.entries(futuresCandles)) {
                pointers.push({
                    index: Number(index), 
                    openNum: parseFloat(candle.open),
                    highNum: parseFloat(candle.high),
                    lowNum: parseFloat(candle.low),
                    closeNum: parseFloat(candle.close),
                    openTimeString: timestampToString(candle.openTime),
                    ...candle
                })
            }

            return pointers;
        } catch (error) {
            throw error;
        }
    }

    async calculatorCypherPattern(symbol: string, interval: CandleChartInterval_LT = '1h', limit: number = 500): Promise<ChartResult[]>
    {
        const response: ChartResult[] = [];
        const futuresCandles: Pointer[] = await this.getFuturesCandles({
            symbol: symbol,
            interval,
            limit,
        })
        const { swingLows, swingHighs } = this.findSwingLowsAndHighs(futuresCandles);

        for (const [lowestIndex, lowest] of Object.entries(swingLows)) {
            if (Number(lowestIndex) > 0 && swingLows[Number(lowestIndex) - 1].lowNum < swingLows[Number(lowestIndex)].lowNum) {
                continue;
            }
            const lowestPrice = lowest.lowNum;
            const newHighs = swingHighs.filter(function (high) {
                const highPrice = high.highNum;
                return highPrice > lowestPrice && high.openTime > lowest.openTime;
            });
            if (newHighs.length == 0) continue;
            for (const [highestIndex, highest] of Object.entries(newHighs)) {
                const highestPrice = highest.highNum;

                if (lowest.high > highest.high || (highest.index -lowest.index) < 10) continue;

                // check co diem nao nam giua XA lon hon A va be hon X khong

                const isExistAHighest = futuresCandles.find(
                    item => item.openTime > lowest.openTime && item.openTime < highest.openTime && (item.high > highest.high || item.low < lowest.low)
                );
                if (isExistAHighest) {
                    continue;
                }

                // check co diem nao nam giua XA < X khong
                const isExistXLowest = swingLows.find(
                    item => item.index > lowest.index && item.index < highest.index && item.low < lowest.low
                );
                if (isExistXLowest) {
                    continue;
                }

                // tim B
                const bMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL.CYPHER.B_MIN);
                const bMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL.CYPHER.B_MAX);

                //kiem tra trong mang co ton tai diem B hop le khong 
                let listB = swingLows.filter(function (lowB) {
                    const price = lowB.lowNum;
                    // filter price nam giua bMin & bMax 
                    const condition = price >= bMin && price <= bMax  && lowB.openTime >= highest.openTime && lowB.high <= highest.high;// && lowB.low > lowest.low
                    // tiep tuc filter B xem co diem nao khong thoa nam giua XA va B hay khong
                    if (condition) {
                        // check A -> B: 
                        const foundLowest = futuresCandles.find(item => 
                            item.index > highest.index && item.index < lowB.index && (item.lowNum < lowB.lowNum || item.highNum > highest.highNum)
                        );

                        return !foundLowest;
                    }
                    return false;
                });

                if (listB.length == 0) {
                    continue;
                }
                // console.log(33, listB);

                // const minPriceB = Math.max(...listB.map(b => b.price));
                // const minIndexB = Math.min(...listB.map(b => b.index));

                // tim C
                const cMin = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL.CYPHER.C_MIN);
                const cMax = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL.CYPHER.C_MAX);

                // tim D
                const dMin = upFibonacciRetracement(lowestPrice, cMin, CONSTANT.LEVEL.CYPHER.D_MIN);
                const dMax = upFibonacciRetracement(lowestPrice, cMax, CONSTANT.LEVEL.CYPHER.D_MIN);

                //kiem tra trong mang co ton tai diem C hop le khong 
                const listC = newHighs.filter(function (highC) {
                    return highC.highNum >= cMin && highC.highNum <= cMax;
                });

                for (const pointB of listB) {
                    for (const pointC of listC) {
                        if (pointC.openTime < pointB.openTime) continue;

                        const unValidPeak = futuresCandles.find(item => 
                            item.openTime > pointB.openTime && item.openTime < pointC.openTime && (item.lowNum < pointB.lowNum || item.highNum > pointC.highNum)
                        );

                        if (unValidPeak) {
                            continue;
                        }

                        const listD = swingLows.filter(function (lowD) {
                            const price = lowD.lowNum;
                            const condition = price >= dMin && price <= dMax && lowD.openTime > pointC.openTime;
                            if (condition) {
                                let unValidPeak = futuresCandles.find(item => 
                                    pointC.openTime < item.openTime && item.openTime < lowD.openTime && (item.lowNum < lowD.lowNum || item.highNum > pointC.highNum)
                                );
                                return !unValidPeak;
                            }
                            return false;
                        });

                        if (listD.length > 0) {
                            console.log("Data Found");
                            response.push({
                                xPrice: lowest.low,
                                xTime: lowest.openTimeString,
                                aPrice: highest.high,
                                aTime: highest.openTimeString,
                                bPrice: pointB,
                                cPrice: pointC,
                                dPrices: listD,
                            });
                        }
                    }
                }


            }
        }
        return response;
    }

    // Hàm xác định điểm Swing Low
    findSwingLowsAndHighs(data: Pointer[]): SwingResult {
        const swingLows: Pointer[] = [];
        const swingHighs: Pointer[] = [];
        for (let i = 1; i < data.length; i++) {
            const currentItem = data[i];
            const prevItem = data[i - 1];
            let nextItem: Pointer;
            if (i == (data.length - 1)) {
                nextItem = data[i];
            } else {
                nextItem = data[i + 1];
            }
            const prevLowPrice = prevItem.lowNum;
            const currLowPrice = currentItem.lowNum;
            const nextLowPrice = nextItem.lowNum;
            
            if (currLowPrice < prevLowPrice && currLowPrice <= nextLowPrice) {
                swingLows.push(currentItem);
            }

            const prevHighPrice = prevItem.highNum;
            const currHighPrice = currentItem.highNum;
            const nextHighPrice = nextItem.highNum;

            if (currHighPrice > prevHighPrice && currHighPrice >= nextHighPrice) {
                swingHighs.push(currentItem);
            }
        }
        return {
            swingLows,
            swingHighs
        };
    }
}
