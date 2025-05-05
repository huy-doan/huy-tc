import { Injectable } from '@nestjs/common';
import binanceApiNode, { Binance, Candle, CandleChartInterval_LT, CandleChartResult, CandlesOptions } from 'binance-api-node';
import { CONSTANT } from '~config/const.config';
import { downFibonacciRetracement, upFibonacciRetracement } from '~helpers/formula.helper';
import { timestampToString } from '~helpers/time.helper';
import { AnalyzeResult, ChartResult, CustomCandle, SwingResult, Symbol } from '~interfaces/common.interface';
import { SwingDetector } from '~libs/harmonic/SwingDetector';

@Injectable()
export class OldBinanceService {
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

                // if (symbol !== 'EOSUSDT') {
                //     continue;
                // }

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
                // return res;
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
        // console.log(`Swing points :`, swingLows, swingHighs);

                        
        // Tìm các swing points
        // const { swingLows, swingHighs } = SwingDetector.findSwingLowsAndHighs(futuresCandles);
        // console.log(`Swing points for ${symbol}:`, swingResult);
        // Lọc các swing points có ý nghĩa
        // const { swingLows, swingHighs } = SwingDetector.filterSignificantSwings(swingResult, futuresCandles);
        // let chartResults: ChartResult[] = [];

        /** Bullish cypher */
        response = this.bullishCypher(response, futuresCandles, swingLows, swingHighs, 'CYPHER');
        
        /** Bearish cypher */
        response = this.bearishCypher(response, futuresCandles, swingLows, swingHighs, 'CYPHER');

        /** Bullish BAT */
        response = this.bullishBat(response, futuresCandles, swingLows, swingHighs, 'BAT');

        /** Bearish BAT */
        response = this.bearishBat(response, futuresCandles, swingLows, swingHighs, 'BAT');

        /** Bullish Gartley */
        response = this.bullishGartley(response, futuresCandles, swingLows, swingHighs, 'GARTLEY');

        /** Bearish Gartley */
        response = this.bearishGartley(response, futuresCandles, swingLows, swingHighs, 'GARTLEY');

        /** Bullish Butterfly */
        response = this.bullishButterfly(response, futuresCandles, swingLows, swingHighs, 'BUTTERFLY');

        /** Bearish Butterfly */
        response = this.bearishButterfly(response, futuresCandles, swingLows, swingHighs, 'BUTTERFLY');

        /** Bullish Crab */
        response = this.bullishCrab(response, futuresCandles, swingLows, swingHighs, 'CRAB');

        /** Bearish Crab */
        response = this.bearishCrab(response, futuresCandles, swingLows, swingHighs, 'CRAB');

        /** Bullish Shark */
        response = this.bullishShark(response, futuresCandles, swingLows, swingHighs, 'SHARK');

        /** Bearish Shark */
        response = this.bearishShark(response, futuresCandles, swingLows, swingHighs, 'SHARK');

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
                            console.log("bullish Cypher");
                            console.log("highestPrice", highestPrice);
                            console.log("lowestPrice", lowestPrice);
                            console.log("bMin", bMin);
                            console.log("bMax", bMax);


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
                            console.log("highestPrice", highestPrice);
                            console.log("lowestPrice", lowestPrice);
                            console.log("bMin", bMin);
                            console.log("bMax", bMax);
                            console.log("cMin", cMin);
                            console.log("cMax", cMax);
                            console.log("dMin", dMin);
                            console.log("dMax", dMax);

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
                            
                            console.log("bullishBat");
                            console.log("highestPrice", highestPrice);
                            console.log("lowestPrice", lowestPrice);
                            console.log("bMin", bMin);
                            console.log("bMax", bMax);
                            
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
                            console.log("bearishBat");
                            console.log("highestPrice", highestPrice);
                            console.log("lowestPrice", lowestPrice);
                            console.log("bMin", bMin);
                            console.log("bMax", bMax);


                            
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

    bullishGartley(response: ChartResult[], futuresCandles: CustomCandle[], swingLows: CustomCandle[], swingHighs: CustomCandle[], harmonicType: string) {
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

                const isExistXLowest = swingLows.find(
                    item => item.index > lowest.index && item.index < highest.index && item.lowNum < lowest.lowNum
                );
                if (isExistXLowest) {
                    continue;
                }

                // tim B - Gartley B is around 0.618 of XA
                const bMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].B_MIN);
                const bMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].B_MAX);

                let listB = swingLows.filter(function (lowB) {
                    const price = lowB.lowNum;
                    const condition = price >= bMin && price <= bMax  && lowB.openTime >= highest.openTime && lowB.highNum <= highest.highNum;
                    if (condition) {
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

                // tim C - Gartley C is retracement of AB
                const cMin = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MIN);
                const cMax = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MAX);

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

                        // tim D - Gartley D is retracement of XC
                        const dMin = upFibonacciRetracement(lowestPrice, pointC.highNum, CONSTANT.LEVEL[harmonicType].D_MIN);
                        const dMax = upFibonacciRetracement(lowestPrice, pointC.highNum, CONSTANT.LEVEL[harmonicType].D_MAX);

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
                            console.log("Bullish Gartley");
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

    bearishGartley(response: ChartResult[], futuresCandles: CustomCandle[], swingLows: CustomCandle[], swingHighs: CustomCandle[], harmonicType: string) {
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
    
                const isExistAHighest = futuresCandles.find(
                    item => item.openTime > highest.openTime && item.openTime < lowest.openTime && (item.highNum > highest.highNum || item.lowNum < lowest.lowNum)
                );
                if (isExistAHighest) {
                    continue;
                }
    
                const isExistXHighest = swingHighs.find(
                    item => item.index > highest.index && item.index < lowest.index && item.highNum > highest.highNum
                );
    
                if (isExistXHighest) {
                    continue;
                }
    
                // tim B - Gartley B is around 0.618 of XA
                const bMin = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].B_MIN);
                const bMax = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].B_MAX);
    
                let listB = swingHighs.filter(function (highB) {
                    const price = highB.highNum;
                    const condition = price >= bMin && price <= bMax && highB.openTime >= lowest.openTime && highB.lowNum >= lowest.lowNum;
                    if (condition) {
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
    
                // tim C - Gartley C is retracement of AB
                const cMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MIN);
                const cMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MAX);
    
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
    
                        // tim D - Gartley D is retracement of XC
                        const dMax = downFibonacciRetracement(pointC.lowNum, highestPrice, CONSTANT.LEVEL[harmonicType].D_MIN);
                        const dMin = downFibonacciRetracement(pointC.lowNum, highestPrice, CONSTANT.LEVEL[harmonicType].D_MAX);
    
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
    
                        if (listD.length > 0) {
                            console.log("Bearish Gartley");
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

    bullishButterfly(response: ChartResult[], futuresCandles: CustomCandle[], swingLows: CustomCandle[], swingHighs: CustomCandle[], harmonicType: string)
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
    
                const isExistXLowest = swingLows.find(
                    item => item.index > lowest.index && item.index < highest.index && item.lowNum < lowest.lowNum
                );
                if (isExistXLowest) {
                    continue;
                }
    
                // tim B - Butterfly B is around 0.786 of XA
                const bMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].B_MIN);
                const bMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].B_MAX);
    
                let listB = swingLows.filter(function (lowB) {
                    const price = lowB.lowNum;
                    const condition = price >= bMin && price <= bMax  && lowB.openTime >= highest.openTime && lowB.highNum <= highest.highNum;
                    if (condition) {
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
    
                // tim C - Butterfly C is retracement of AB
                const cMin = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MIN);
                const cMax = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MAX);
    
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
    
                        // tim D - Butterfly D is extension of XA
                        const dMin = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].D_MIN);
                        const dMax = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].D_MAX);
    
                        const listD = swingLows.filter(function (lowD) {
                            const price = lowD.lowNum;
                            const condition = price <= dMin && price >= dMax && lowD.openTime > pointC.openTime;
                            if (condition) {
                                let unValidPeak = futuresCandles.find(item => 
                                    pointC.openTime < item.openTime && item.openTime < lowD.openTime && (item.lowNum < lowD.lowNum || item.highNum > pointC.highNum)
                                );
                                return !unValidPeak;
                            }
                            return false;
                        });
    
                        if (listD.length > 0) {
                            console.log("Bullish Butterfly");
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

    bearishButterfly(response: ChartResult[], futuresCandles: CustomCandle[], swingLows: CustomCandle[], swingHighs: CustomCandle[], harmonicType: string) {
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
    
                const isExistAHighest = futuresCandles.find(
                    item => item.openTime > highest.openTime && item.openTime < lowest.openTime && (item.highNum > highest.highNum || item.lowNum < lowest.lowNum)
                );
                if (isExistAHighest) {
                    continue;
                }
    
                const isExistXHighest = swingHighs.find(
                    item => item.index > highest.index && item.index < lowest.index && item.highNum > highest.highNum
                );
    
                if (isExistXHighest) {
                    continue;
                }
    
                // tim B - Butterfly B is around 0.786 of XA
                const bMin = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].B_MIN);
                const bMax = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].B_MAX);
    
                let listB = swingHighs.filter(function (highB) {
                    const price = highB.highNum;
                    const condition = price >= bMin && price <= bMax && highB.openTime >= lowest.openTime && highB.lowNum >= lowest.lowNum;
                    if (condition) {
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
    
                // tim C - Butterfly C is retracement of AB
                const cMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MIN);
                const cMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MAX);
    
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
    
                        // tim D - Butterfly D is extension of XA
                        const dMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].D_MIN);
                        const dMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].D_MAX);
    
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
    
                        if (listD.length > 0) {
                            console.log("Bearish Butterfly");
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

    bullishCrab(response: ChartResult[], futuresCandles: CustomCandle[], swingLows: CustomCandle[], swingHighs: CustomCandle[], harmonicType: string)
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

                const isExistXLowest = swingLows.find(
                    item => item.index > lowest.index && item.index < highest.index && item.lowNum < lowest.lowNum
                );
                if (isExistXLowest) {
                    continue;
                }

                // tim B - Crab B is retracement of XA
                const bMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].B_MIN);
                const bMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].B_MAX);

                let listB = swingLows.filter(function (lowB) {
                    const price = lowB.lowNum;
                    const condition = price >= bMin && price <= bMax  && lowB.openTime >= highest.openTime && lowB.highNum <= highest.highNum;
                    if (condition) {
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

                // tim C - Crab C is retracement of AB
                const cMin = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MIN);
                const cMax = downFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MAX);

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

                        // tim D - Crab D is extension of XA
                        const dMin = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].D_MIN);
                        const dMax = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].D_MAX);

                        const listD = swingLows.filter(function (lowD) {
                            const price = lowD.lowNum;
                            const condition = price <= dMin && price >= dMax && lowD.openTime > pointC.openTime;
                            if (condition) {
                                let unValidPeak = futuresCandles.find(item => 
                                    pointC.openTime < item.openTime && item.openTime < lowD.openTime && (item.lowNum < lowD.lowNum || item.highNum > pointC.highNum)
                                );
                                return !unValidPeak;
                            }
                            return false;
                        });

                        if (listD.length > 0) {
                            console.log("Bullish Crab");
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

    bearishCrab(response: ChartResult[], futuresCandles: CustomCandle[], swingLows: CustomCandle[], swingHighs: CustomCandle[], harmonicType: string) {
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
    
                const isExistAHighest = futuresCandles.find(
                    item => item.openTime > highest.openTime && item.openTime < lowest.openTime && (item.highNum > highest.highNum || item.lowNum < lowest.lowNum)
                );
                if (isExistAHighest) {
                    continue;
                }
    
                const isExistXHighest = swingHighs.find(
                    item => item.index > highest.index && item.index < lowest.index && item.highNum > highest.highNum
                );
    
                if (isExistXHighest) {
                    continue;
                }
    
                // tim B - Crab B is retracement of XA
                const bMin = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].B_MIN);
                const bMax = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].B_MAX);
    
                let listB = swingHighs.filter(function (highB) {
                    const price = highB.highNum;
                    const condition = price >= bMin && price <= bMax && highB.openTime >= lowest.openTime && highB.lowNum >= lowest.lowNum;
                    if (condition) {
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
    
                // tim C - Crab C is retracement of AB
                const cMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MIN);
                const cMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].C_MAX);
    
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
    
                        // tim D - Crab D is extension of XA
                        const dMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].D_MIN);
                        const dMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].D_MAX);
    
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
    
                        if (listD.length > 0) {
                            console.log("Bearish Crab");
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

    bullishShark(response: ChartResult[], futuresCandles: CustomCandle[], swingLows: CustomCandle[], swingHighs: CustomCandle[], harmonicType: string)
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

                const isExistXLowest = swingLows.find(
                    item => item.index > lowest.index && item.index < highest.index && item.lowNum < lowest.lowNum
                );
                if (isExistXLowest) {
                    continue;
                }

                // tim B - Shark B is retracement of XA
                const bMin = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].B_MIN);
                const bMax = upFibonacciRetracement(lowestPrice, highestPrice, CONSTANT.LEVEL[harmonicType].B_MAX);

                let listB = swingLows.filter(function (lowB) {
                    const price = lowB.lowNum;
                    const condition = price >= bMin && price <= bMax  && lowB.openTime >= highest.openTime && lowB.highNum <= highest.highNum;
                    if (condition) {
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

                // tim C - Shark C is extension of XA
                const cMin = highestPrice + (highestPrice - listB[0].lowNum) * CONSTANT.LEVEL[harmonicType].C_MIN;
                const cMax = highestPrice + (highestPrice - listB[0].lowNum) * CONSTANT.LEVEL[harmonicType].C_MAX;

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

                        // tim D - Shark D is retracement of XC
                        const dMin = upFibonacciRetracement(lowestPrice, pointC.highNum, CONSTANT.LEVEL[harmonicType].D_MIN);
                        const dMax = upFibonacciRetracement(lowestPrice, pointC.highNum, CONSTANT.LEVEL[harmonicType].D_MAX);

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
                            console.log("Bullish Shark");
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

    bearishShark(response: ChartResult[], futuresCandles: CustomCandle[], swingLows: CustomCandle[], swingHighs: CustomCandle[], harmonicType: string) {
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
    
                const isExistAHighest = futuresCandles.find(
                    item => item.openTime > highest.openTime && item.openTime < lowest.openTime && (item.highNum > highest.highNum || item.lowNum < lowest.lowNum)
                );
                if (isExistAHighest) {
                    continue;
                }
    
                const isExistXHighest = swingHighs.find(
                    item => item.index > highest.index && item.index < lowest.index && item.highNum > highest.highNum
                );
    
                if (isExistXHighest) {
                    continue;
                }
    
                // tim B - Shark B is retracement of XA
                const bMin = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].B_MIN);
                const bMax = downFibonacciRetracement(highestPrice, lowestPrice, CONSTANT.LEVEL[harmonicType].B_MAX);
    
                let listB = swingHighs.filter(function (highB) {
                    const price = highB.highNum;
                    const condition = price >= bMin && price <= bMax && highB.openTime >= lowest.openTime && highB.lowNum >= lowest.lowNum;
                    if (condition) {
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
    
                // tim C - Shark C is extension of XA
                const cMin = lowestPrice - (listB[0].highNum - lowestPrice) * CONSTANT.LEVEL[harmonicType].C_MIN;
                const cMax = lowestPrice - (listB[0].highNum - lowestPrice) * CONSTANT.LEVEL[harmonicType].C_MAX;
    
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
    
                        // tim D - Shark D is retracement of XC
                        const dMax = downFibonacciRetracement(pointC.lowNum, highestPrice, CONSTANT.LEVEL[harmonicType].D_MIN);
                        const dMin = downFibonacciRetracement(pointC.lowNum, highestPrice, CONSTANT.LEVEL[harmonicType].D_MAX);
    
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
    
                        if (listD.length > 0) {
                            console.log("Bearish Shark");
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
    findSwingLowsAndHighs(data: CustomCandle[], lookback: number = 3): SwingResult {
        if (data.length < lookback * 2 + 1) {
            return { swingLows: [], swingHighs: [] };
        }

        const swingLows: CustomCandle[] = [];
        const swingHighs: CustomCandle[] = [];
        const sensitivity = CONSTANT.SWING_SETTINGS.SENSITIVITY;
        const minCandlesBetween = CONSTANT.SWING_SETTINGS.MIN_CANDLES_BETWEEN_SWINGS;

        // Bỏ qua những phần tử đầu và cuối không thể xác định
        for (let i = lookback; i < data.length - lookback; i++) {
            const currentCandle = data[i];

            // Kiểm tra swing low
            let isSwingLow = true;
            for (let j = 1; j <= lookback; j++) {
                if (data[i - j].lowNum < currentCandle.lowNum * (1 - sensitivity * 0.0001) || 
                    data[i + j].lowNum < currentCandle.lowNum * (1 - sensitivity * 0.0001)) {
                    isSwingLow = false;
                    break;
                }
            }

            // Kiểm tra swing high
            let isSwingHigh = true;
            for (let j = 1; j <= lookback; j++) {
                if (data[i - j].highNum > currentCandle.highNum * (1 + sensitivity * 0.0001) || 
                    data[i + j].highNum > currentCandle.highNum * (1 + sensitivity * 0.0001)) {
                    isSwingHigh = false;
                    break;
                }
            }

            // Thêm vào danh sách nếu là swing point và đủ khoảng cách từ swing point trước đó
            if (isSwingLow) {
                // Kiểm tra xem đã đủ khoảng cách từ swing low cuối chưa
                const lastSwingLowIndex = swingLows.length > 0 ? 
                    swingLows[swingLows.length - 1].index : -minCandlesBetween - 1;
                
                if (i - lastSwingLowIndex >= minCandlesBetween) {
                    swingLows.push(currentCandle);
                } else if (swingLows.length > 0 && 
                            currentCandle.lowNum < swingLows[swingLows.length - 1].lowNum) {
                    // Thay thế swing low cũ nếu cái mới thấp hơn
                    swingLows[swingLows.length - 1] = currentCandle;
                }
            }

            if (isSwingHigh) {
                // Kiểm tra xem đã đủ khoảng cách từ swing high cuối chưa
                const lastSwingHighIndex = swingHighs.length > 0 ? 
                    swingHighs[swingHighs.length - 1].index : -minCandlesBetween - 1;
                
                if (i - lastSwingHighIndex >= minCandlesBetween) {
                    swingHighs.push(currentCandle);
                } else if (swingHighs.length > 0 && 
                            currentCandle.highNum > swingHighs[swingHighs.length - 1].highNum) {
                    // Thay thế swing high cũ nếu cái mới cao hơn
                    swingHighs[swingHighs.length - 1] = currentCandle;
                }
            }
        }

        return { swingLows, swingHighs };
    }
}
