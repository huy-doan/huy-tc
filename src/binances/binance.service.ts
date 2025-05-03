import { Injectable } from '@nestjs/common';
import binanceApiNode, { Binance, Candle, CandleChartInterval_LT, CandleChartResult, CandlesOptions } from 'binance-api-node';
import { merge } from 'rxjs';
import { CONSTANT } from '~config/const.config';
import Constants from '~constants/Constants';
import { downFibonacciRetracement, upFibonacciRetracement } from '~helpers/formula.helper';
import { timestampToString } from '~helpers/time.helper';
import { AnalyzeResult, ChartResult, CustomCandle, SwingResult, Symbol } from '~interfaces/common.interface';
import Candlestick from '~libs/candlestick/Candlestick';

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
                const futuresCandles: CustomCandle[] = await this.getFuturesCandles({
                    symbol: symbol,
                    interval,
                    limit,
                })
                if (futuresCandles.length == 0) {
                    continue;
                }
                const chartResult: ChartResult[] = await this.calculatorCypherPattern(futuresCandles);
                console.log(chartResult.length );
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

    async getFuturesCandles(candlesOptions: CandlesOptions): Promise<CustomCandle[]>
    {
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
                })
            }

            return pointers;
        } catch (error) {
            return [] as CustomCandle[];
        }
    }

    async calculatorCypherPattern(futuresCandles: CustomCandle[]): Promise<ChartResult[]>
    {
        // const candleStick = new Candlestick();
        let response: ChartResult[] = [];
        const { swingLows, swingHighs } = this.findSwingLowsAndHighs(futuresCandles);

        /** Bullish cypher */
        response = this.bullishCypher(response, futuresCandles, swingLows, swingHighs, 'CYPHER');
        
        /** Bearish cypher */
        response = this.bearishCypher(response, futuresCandles, swingLows, swingHighs, 'CYPHER');

        /** Bullish BAT */
        response = this.bullishBat(response, futuresCandles, swingLows, swingHighs, 'BAT');

        /** Bearish BAT */
        response = this.bearishBat(response, futuresCandles, swingLows, swingHighs, 'BAT');

        return response;
    }

    bullishCypher(response: ChartResult[], futuresCandles: CustomCandle[], swingLows: CustomCandle[], swingHighs: CustomCandle[], harmonicType: string)
    {
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

                if (lowest.highNum > highest.highNum || (highest.index -lowest.index) < 10) continue;

                const isExistAHighest = futuresCandles.find(
                    item => item.openTime > lowest.openTime && item.openTime < highest.openTime && (item.highNum > highest.highNum || item.lowNum < lowest.lowNum)
                );
                if (isExistAHighest) {
                    continue;
                }

                // check co diem nao nam giua XA < X khong
                const isExistXLowest = swingLows.find(
                    item => item.index > lowest.index && item.index < highest.index && item.lowNum < lowest.lowNum
                );
                if (isExistXLowest) {
                    continue;
                }

                // tim B
                const bMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].B_MIN);
                const bMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].B_MAX);

                //kiem tra trong mang co ton tai diem B hop le khong 
                let listB = swingLows.filter(function (lowB) {
                    const price = lowB.lowNum;
                    // filter price nam giua bMin & bMax 
                    const condition = price >= bMin && price <= bMax  && lowB.openTime >= highest.openTime && lowB.highNum <= highest.highNum;// && lowB.lowNum > lowest.lowNum
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

                // tim C
                const cMin = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MIN);
                const cMax = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MAX);

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

                         // tim D
                        const dMin = upFibonacciRetracement(lowestPrice, pointC.highNum, CONSTANT.LEVEL[harmonicType].D_MIN);
                        const dMax = upFibonacciRetracement(lowestPrice, pointC.highNum, CONSTANT.LEVEL[harmonicType].D_MIN);

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

                        // kiem tra D co thuoc 127.2-200% BC khong
                        if (listD.length > 0) {
                            console.log("Data Found");
                            response.push({
                                xPrice: lowest,
                                aPrice: highest,
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

    bearishCypher(response: ChartResult[], futuresCandles: CustomCandle[], swingLows: CustomCandle[], swingHighs: CustomCandle[], harmonicType: string) {
        for (const [highestIndex, highest] of Object.entries(swingHighs)) {
            if (Number(highestIndex) > 0 && swingHighs[Number(highestIndex) - 1].highNum > swingHighs[Number(highestIndex)].highNum) {
                continue;
            }
            const highestPrice = highest.highNum;
            const newLows = swingLows.filter(function (low) {
                const lowPrice = low.lowNum;
                return lowPrice < highestPrice && low.openTime > highest.openTime;
            });

            if (newLows.length == 0) continue;
            for (const [lowestIndex, lowest] of Object.entries(newLows)) {
                const lowestPrice = lowest.lowNum;
    
                if (highest.lowNum < lowest.lowNum || (lowest.index - highest.index) < 10) continue;
    
                // Check if there is any point between XA that is higher than X and lower than A
                const isExistAHighest = futuresCandles.find(
                    item => item.openTime > highest.openTime && item.openTime < lowest.openTime && (item.highNum > highest.highNum || item.lowNum < lowest.lowNum)
                );
                if (isExistAHighest) {
                    continue;
                }
    
                // Check if there is any point between XA > X
                const isExistXHighest = swingHighs.find(
                    item => item.index > highest.index && item.index < lowest.index && item.highNum > highest.highNum
                );

                if (isExistXHighest) {
                    continue;
                }
    
                // Find B
                const bMin = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].B_MIN);
                const bMax = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].B_MAX);
    
                // Check if there exists a valid B point in the range
                let listB = swingHighs.filter(function (highB) {
                    const price = highB.highNum;
                    // Filter price in the range [bMin, bMax]
                    const condition = price >= bMin && price <= bMax && highB.openTime >= lowest.openTime && highB.lowNum >= lowest.lowNum;
                    // Further filter B to see if there's any point between XA and B
                    if (condition) {
                        // Check A -> B:
                        const foundHighest = futuresCandles.find(item =>
                            item.index > lowest.index && item.index < highB.index && (item.highNum > highB.highNum || item.lowNum < lowest.lowNum)
                        );
    
                        return !foundHighest;
                    }
                    return false;
                });
    
                if (listB.length == 0) {
                    continue;
                }

                // Find C
                const cMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MIN);
                const cMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MAX);
    
                // Find D
                const dMin = downFibonacciRetracement(cMin, highestPrice, CONSTANT.LEVEL[harmonicType].D_MIN);
                const dMax = downFibonacciRetracement(cMax, highestPrice, CONSTANT.LEVEL[harmonicType].D_MIN);
    
                // Check for valid C points
                const listC = newLows.filter(function (lowC) {
                    return lowC.lowNum >= cMin && lowC.lowNum <= cMax;
                });
                for (const pointB of listB) {
                    for (const pointC of listC) {
                        if (pointC.openTime < pointB.openTime) continue;
    
                        const unValidPeak = futuresCandles.find(item =>
                            item.openTime > pointB.openTime && item.openTime < pointC.openTime && (item.highNum > pointB.highNum || item.lowNum < pointC.lowNum)
                        );
    
                        if (unValidPeak) {
                            continue;
                        }

                        const listD = swingHighs.filter(function (highD) {
                            const price = highD.highNum;

                            const condition = price >= dMin && price <= dMax && highD.openTime > pointC.openTime;
                            if (condition) {
                                let unValidPeak = futuresCandles.find(item =>
                                    pointC.openTime < item.openTime && item.openTime < highD.openTime && (item.highNum > highD.highNum || item.lowNum < pointC.lowNum)
                                );
                                return !unValidPeak;
                            }
                            return false;
                        });
    
                        // Check if D is within 127.2-200% of BC
                        if (listD.length > 0) {
                            console.log(pointC.lowNum, dMin, dMax);
                            console.log("Bearish Cypher Data Found");
                            response.push({
                                xPrice: highest,
                                aPrice: lowest,
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

    bullishBat(response: ChartResult[], futuresCandles: CustomCandle[], swingLows: CustomCandle[], swingHighs: CustomCandle[], harmonicType: string)
    {
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

                if (lowest.highNum > highest.highNum || (highest.index -lowest.index) < 10) continue;

                // check co diem nao nam giua XA lon hon A va be hon X khong

                const isExistAHighest = futuresCandles.find(
                    item => item.openTime > lowest.openTime && item.openTime < highest.openTime && (item.highNum > highest.highNum || item.lowNum < lowest.lowNum)
                );
                if (isExistAHighest) {
                    continue;
                }

                // check co diem nao nam giua XA < X khong
                const isExistXLowest = swingLows.find(
                    item => item.index > lowest.index && item.index < highest.index && item.lowNum < lowest.lowNum
                );
                if (isExistXLowest) {
                    continue;
                }

                // tim B
                const bMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].B_MIN);
                const bMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].B_MAX);

                //kiem tra trong mang co ton tai diem B hop le khong 
                let listB = swingLows.filter(function (lowB) {
                    const price = lowB.lowNum;
                    // filter price nam giua bMin & bMax 
                    const condition = price >= bMin && price <= bMax  && lowB.openTime >= highest.openTime && lowB.highNum <= highest.highNum;// && lowB.lowNum > lowest.lowNum
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

                // tim C
                const cMin = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MIN);
                const cMax = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MAX);

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

                         // tim D
                        const dMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].D_MIN);
                        const dMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].D_MAX);
                                
                        // tim DBC
                        const dBCMax = upFibonacciRetracement(pointB.lowNum, pointC.highNum, CONSTANT.LEVEL[harmonicType].D_BC_MIN);
                        const dBCMin = upFibonacciRetracement(pointB.lowNum, pointC.highNum, CONSTANT.LEVEL[harmonicType].D_BC_MAX);

                        const listD = swingLows.filter(function (lowD) {
                            const price = lowD.lowNum;
                            const condition = (price >= dMin && price <= dMax) && (price >= dBCMin && price <= dBCMax) && lowD.openTime > pointC.openTime;

                            if (condition) {
                                let unValidPeak = futuresCandles.find(item => 
                                    pointC.openTime < item.openTime && item.openTime < lowD.openTime && (item.lowNum < lowD.lowNum || item.highNum > pointC.highNum)
                                );
                                return !unValidPeak;
                            }
                            return false;
                        });

                        if (listD.length > 0) {
                            console.log("Data Found Bullish Bat");
                            response.push({
                                xPrice: lowest,
                                aPrice: highest,
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

    bearishBat(response: ChartResult[], futuresCandles: CustomCandle[], swingLows: CustomCandle[], swingHighs: CustomCandle[], harmonicType: string) {
        for (const [highestIndex, highest] of Object.entries(swingHighs)) {
            if (Number(highestIndex) > 0 && swingHighs[Number(highestIndex) - 1].highNum > swingHighs[Number(highestIndex)].highNum) {
                continue;
            }
            const highestPrice = highest.highNum;
            const newLows = swingLows.filter(function (low) {
                const lowPrice = low.lowNum;
                return lowPrice < highestPrice && low.openTime > highest.openTime;
            });

            if (newLows.length == 0) continue;
            for (const [lowestIndex, lowest] of Object.entries(newLows)) {
                const lowestPrice = lowest.lowNum;
    
                if (highest.lowNum < lowest.lowNum || (lowest.index - highest.index) < 10) continue;
    
                // Check if there is any point between XA that is higher than X and lower than A
                const isExistAHighest = futuresCandles.find(
                    item => item.openTime > highest.openTime && item.openTime < lowest.openTime && (item.highNum > highest.highNum || item.lowNum < lowest.lowNum)
                );
                if (isExistAHighest) {
                    continue;
                }
    
                // Check if there is any point between XA > X
                const isExistXHighest = swingHighs.find(
                    item => item.index > highest.index && item.index < lowest.index && item.highNum > highest.highNum
                );

                if (isExistXHighest) {
                    continue;
                }
    
                // Find B
                const bMin = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].B_MIN);
                const bMax = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].B_MAX);
    
                // Check if there exists a valid B point in the range
                let listB = swingHighs.filter(function (highB) {
                    const price = highB.highNum;
                    // Filter price in the range [bMin, bMax]
                    const condition = price >= bMin && price <= bMax && highB.openTime >= lowest.openTime && highB.lowNum >= lowest.lowNum;
                    // Further filter B to see if there's any point between XA and B
                    if (condition) {
                        // Check A -> B:
                        const foundHighest = futuresCandles.find(item =>
                            item.index > lowest.index && item.index < highB.index && (item.highNum > highB.highNum || item.lowNum < lowest.lowNum)
                        );
    
                        return !foundHighest;
                    }
                    return false;
                });
    
                if (listB.length == 0) {
                    continue;
                }

                // Find C
                const cMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MIN);
                const cMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MAX);

                // Check for valid C points
                const listC = newLows.filter(function (lowC) {
                    return lowC.lowNum >= cMin && lowC.lowNum <= cMax;
                });
                for (const pointB of listB) {
                    for (const pointC of listC) {
                        if (pointC.openTime < pointB.openTime) continue;
    
                        const unValidPeak = futuresCandles.find(item =>
                            item.openTime > pointB.openTime && item.openTime < pointC.openTime && (item.highNum > pointB.highNum || item.lowNum < pointC.lowNum)
                        );
    
                        if (unValidPeak) {
                            continue;
                        }

                        // tim D
                        const dMin = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].D_MIN);
                        const dMax = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].D_MAX);
                        
                        // tim DBC
                        const dBCMin = downFibonacciRetracement(pointC.lowNum, pointB.highNum, CONSTANT.LEVEL[harmonicType].D_BC_MIN);
                        const dBCMax = downFibonacciRetracement(pointC.lowNum, pointB.highNum, CONSTANT.LEVEL[harmonicType].D_BC_MAX);

                        const listD = swingHighs.filter(function (highD) {
                            const price = highD.highNum;

                            const condition = (price >= dMin && price <= dMax) && (price >= dBCMin && price <= dBCMax) && highD.openTime > pointC.openTime;
                            if (condition) {
                                let unValidPeak = futuresCandles.find(item =>
                                    pointC.openTime < item.openTime && item.openTime < highD.openTime && (item.highNum > highD.highNum || item.lowNum < pointC.lowNum)
                                );
                                return !unValidPeak;
                            }
                            return false;
                        });
    
                        if (listD.length > 0) {
                            console.log(pointC.lowNum, dMin, dMax);
                            console.log("Data Found Bearish Bat");
                            response.push({
                                xPrice: highest,
                                aPrice: lowest,
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
    findSwingLowsAndHighs(data: CustomCandle[]): SwingResult {
        const swingLows: CustomCandle[] = [];
        const swingHighs: CustomCandle[] = [];
        for (let i = 1; i < data.length; i++) {
            const currentItem = data[i];
            const prevItem = data[i - 1];
            let nextItem: CustomCandle;
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
