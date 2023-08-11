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
                    limit: 10
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
            // const symbols = await this.getSymbols();
            const symbol = "BTCUSDT";
            // for (const symbolItem of symbols) {
            //     const { symbol } = symbolItem;
                const chartResult: ChartResult[] = await this.calculatorCypherPattern(symbol, interval, limit);
                if (chartResult.length > 0) {
                    const analyzeResult: AnalyzeResult = {
                        symbol,
                        interval,
                        limit,
                        results: chartResult
                    }
                    res.push(analyzeResult);
                }
            // }
            
        } catch (error) {
            throw error;
        }
        

        return res;
    }

    async getFuturesCandles(candlesOptions: CandlesOptions): Promise<CandleChartResult[]>
    {
        try {
            return this.binance.futuresCandles(candlesOptions);
        } catch (error) {
            throw new Error('Failed to fetch Bitcoin price from Binance API');
        }
    }

    async calculatorCypherPattern(symbol: string, interval: CandleChartInterval_LT = '1h', limit: number = 500): Promise<ChartResult[]>
    {
        const response: ChartResult[] = [];
        const futuresCandles: CandleChartResult[] = await this.getFuturesCandles({
            symbol: symbol,
            interval,
            limit,
        })
        const { swingLows, swingHighs } = this.findSwingLowsAndHighs(futuresCandles);

        for (const [lowestIndex, lowest] of Object.entries(swingLows)) {
            const lowestPrice = parseFloat(lowest.price);
            const newHighs = swingHighs.filter(function (high) {
                const highPrice = parseFloat(high.price);
                return highPrice > lowestPrice && high.openTime > lowest.openTime;
            });
            if (newHighs.length == 0) continue;
            for (const [highestIndex, highest] of Object.entries(newHighs)) {
                const highestPrice = parseFloat(highest.price);

                if (lowest.high >= highest.low || (highest.index - lowest.index) < 10) continue;

                // check co diem nao nam giua XA > A khong
                const isExistAHighest = newHighs.slice(0, Number(highestIndex) +1 ).find(
                    item => item.index > lowest.index && item.index < highest.index && item.high > highest.high
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
                    const price = parseFloat(lowB.price);
                    // filter price nam giua bMin & bMax 
                    const condition = price >= bMin && price <= bMax  && lowB.openTime >= highest.openTime && lowB.high <= highest.high;// && lowB.low > lowest.low
                    // tiep tuc filter B xem co diem nao khong thoa nam giua XA va B hay khong
                    if (condition) {
                        // A -> B < B
                        const foundLowest = swingLows.find(item => 
                            item.index > highest.index && item.index < lowB.index && (item.price < lowB.price || item.high > highest.price)
                        );

                        // A -> B : > A & B <
                        const foundHighest = newHighs.find(item => 
                            item.index > highest.index && item.index < lowB.index && (item.price > highest.price || item.low < lowB.price)
                        );

                        return !foundLowest && !foundHighest;
                    }
                    return false;
                });

                if (listB.length == 0) {
                    continue;
                }

                const minPriceB = Math.max(...listB.map(b => parseFloat(b.price)));
                const minIndexB = Math.min(...listB.map(b => b.index));

                // tim C
                const cMin = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL.CYPHER.C_MIN);
                const cMax = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL.CYPHER.C_MAX);

                //kiem tra trong mang co ton tai diem C hop le khong 
                const listC = newHighs.filter(function (highC) {
                    const price = parseFloat(highC.price);
                    const condition = price >= cMin && price <= cMax && highC.index > minIndexB;

                    if (condition) {
                        // // Điều kiện 1: tất cả điểm có index nằm giữa x và b có price không lớn hơn price của b hoặc bé hơn price của x
                        // // const condition1 = (lowB.index > x.index && point.index < b.index) && (point.price <= b.price && point.price >= x.price);
                        // let foundHighest = newHighs.find(item => 
                        //     minIndexB < item.index && item.index < highC.index && (item.price > highC.price || parseFloat(item.price) < bMin)
                        // );

                        // B -> C : > C
                        const foundHighest = newHighs.find(item => 
                            item.index > minIndexB && item.index < highC.index && (item.price > highC.price || parseFloat(item.low) < minPriceB)
                        );

                        // B -> C : > C
                        const foundLowest = swingLows.find(item => 
                            item.index > minIndexB && item.index < highC.index && (parseFloat(item.price) < minPriceB || parseFloat(item.high) > parseFloat(highC.price))
                        );

                        // return !foundHighest;
                    }
                    return false;
                });

                if (listC.length == 0) {
                    continue;
                }
                const maxIndexC = Math.max(...listC.map(c => c.index));

                let finalB: Pointer[] = [];
                for (const itemB of listB) {
                    const findExistLowest = swingLows.find(item => item.index > itemB.index && item.index < maxIndexC && (item.low < itemB.low || item.high > highest.price));
                    if (!findExistLowest) {
                        finalB.push(itemB);
                    }
                }

                if (finalB.length == 0) {
                    continue;
                }

                // tim D
                const dMin = upFibonacciRetracement(lowestPrice, cMin, CONSTANT.LEVEL.CYPHER.D_MIN);
                const dMax = upFibonacciRetracement(lowestPrice, cMax, CONSTANT.LEVEL.CYPHER.D_MIN);

                const minIndexC = Math.min(...listC.map(c => c.index));

                // check them CD ton tai dinh cao hon C, thap hon D. AB co dinh cao hon A. xa diinh cao hon A, BC co diem lon hon C
                const listD = swingLows.filter(function (lowD) {
                    const price = parseFloat(lowD.price);
                    const condition = price >= dMin && price <= dMax && lowD.index > minIndexC;
                    if (condition) {
                        let foundHighest = swingLows.find(item => 
                            minIndexC < item.index && item.index < lowD.index && (item.price < lowD.price || parseFloat(item.price) > cMax)
                        );
                        return !foundHighest;
                    }
                    return false;
                });

                if (listD .length > 0) {
                    console.log("Data found");
                    response.push({
                        xPrice: lowest.price,
                        xTime: lowest.openTimeString,
                        aPrice: highest.price,
                        aTime: highest.openTimeString,
                        bPrices: finalB,
                        cPrices: listC,
                        dPrices: listD,
                    });
                }
            }
        }
        return response;
    }

    // Hàm xác định điểm Swing Low
    findSwingLowsAndHighs(data: CandleChartResult[]): SwingResult {
        const swingLows: Pointer[] = [];
        const swingHighs: Pointer[] = [];
        for (let i = 1; i < data.length - 1; i++) {
            const openTimeString = timestampToString(data[i].openTime);

            const prevLowPrice = parseFloat(data[i - 1].low);
            const currLowPrice = parseFloat(data[i].low);
            const nextLowPrice = parseFloat(data[i + 1].low);
            
            if (currLowPrice < prevLowPrice && currLowPrice < nextLowPrice) {

                const item: Pointer = { 
                    index: i, 
                    price: data[i].low,
                    openTimeString,
                    ...data[i]
                };
                swingLows.push(item);
            }

            const prevHighPrice = parseFloat(data[i - 1].high);
            const currHighPrice = parseFloat(data[i].high);
            const nextHighPrice = parseFloat(data[i + 1].high);
            
            if (currHighPrice > prevHighPrice && currHighPrice > nextHighPrice) {

                const item: Pointer = { 
                    index: i, 
                    price: data[i].high,
                    openTimeString,
                    ...data[i]
                };
                swingHighs.push(item);
            }
        }
        return {
            swingLows,
            swingHighs
        };
    }
}
