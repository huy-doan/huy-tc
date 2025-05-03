// src/libs/harmonic/patterns/HarmonicPatternBase.ts
import { CustomCandle, ChartResult, SwingResult } from '~interfaces/common.interface';
import { HARMONICS } from '~config/harmonics.config';
import { upFibonacciRetracement, downFibonacciRetracement } from '~helpers/formula.helper';

/**
 * Lớp cơ sở cho các mô hình hài hòa
 */
export abstract class HarmonicPatternBase {
    protected name: string;
    
    constructor() {
        this.name = '';
    }
    
    /**
     * Tên của mô hình bullish
     */
    abstract getBullishPatternName(): string;
    
    /**
     * Tên của mô hình bearish
     */
    abstract getBearishPatternName(): string;
    
    /**
     * Phát hiện mô hình - wrapper method gọi cả bullish và bearish
     */
    detectPattern(candles: CustomCandle[], swingResult: SwingResult): ChartResult[] {
        const results: ChartResult[] = [];
        // Phát hiện mô hình bullish
        const bullishResults = this.detectBullishPattern(candles, swingResult);
        // console.log('bullishResults', bullishResults);

        bullishResults.forEach(result => {
            // Tạo một đối tượng mới với patternName
            const resultWithName: ChartResult = {
                ...result,
                patternName: this.getBullishPatternName()
            };
            results.push(resultWithName);
        });
        
        // Phát hiện mô hình bearish
        const bearishResults = this.detectBearishPattern(candles, swingResult);
        // console.log('bearishResults', bearishResults);

        bearishResults.forEach(result => {
            // Tạo một đối tượng mới với patternName
            const resultWithName: ChartResult = {
                ...result,
                patternName: this.getBearishPatternName()
            };
            results.push(resultWithName);
        });
        console.log('results', results.length);
        return results;
    }
    
    /**
     * Phát hiện mô hình bullish
     * Đây là phương thức chung được sử dụng lại bởi tất cả các mô hình
     * Các tỉ lệ Fibonacci được lấy từ cấu hình dựa trên tên của mô hình
     */
    protected detectBullishPattern(candles: CustomCandle[], swingResult: SwingResult): ChartResult[] {
        const { swingLows, swingHighs } = swingResult;
        const results: ChartResult[] = [];
        const patternLevels = HARMONICS.PATTERNS[this.name as keyof typeof HARMONICS.PATTERNS];

        // Duyệt qua các swing low để tìm điểm X
        for (const [lowestIndex, lowest] of Object.entries(swingLows)) {
            // Bỏ qua nếu không phải là điểm thấp nhất trong vùng
            if (Number(lowestIndex) > 0 && swingLows[Number(lowestIndex) - 1].lowNum < swingLows[Number(lowestIndex)].lowNum) {
                continue;
            }
            console.log('lowest', lowest);

            const lowestPrice = lowest.lowNum;
            
            // Tìm các swing high xảy ra sau X
            const newHighs = swingHighs.filter(high => {
                return high.highNum > lowestPrice && high.openTime > lowest.openTime;
            });
            
            if (newHighs.length === 0) continue;
            
            // Duyệt qua từng swing high để tìm điểm A
            for (const highest of newHighs) {
                const highestPrice = highest.highNum;
                
                // Bỏ qua nếu A không phù hợp
                if (lowest.highNum > highest.highNum || (highest.index - lowest.index) < 10) {
                    continue;
                }
                
                // Kiểm tra không có điểm nào giữa X và A phá vỡ khuôn mẫu
                const isXAValid = !candles.some(candle => 
                    candle.openTime > lowest.openTime && 
                    candle.openTime < highest.openTime && 
                    (candle.highNum > highest.highNum || candle.lowNum < lowest.lowNum)
                );
                
                if (!isXAValid) continue;
                
                // Kiểm tra không có swing low nào thấp hơn X trong khoảng X->A
                const isXLowestValid = !swingLows.some(low => 
                    low.index > lowest.index && 
                    low.index < highest.index && 
                    low.lowNum < lowest.lowNum
                );
                
                if (!isXLowestValid) continue;
                
                // Tìm điểm B (retracement của XA)
                const bMin = upFibonacciRetracement(lowestPrice, highestPrice, patternLevels.B_MIN);
                const bMax = upFibonacciRetracement(lowestPrice, highestPrice, patternLevels.B_MAX);
                
                // Tìm các swing low phù hợp cho điểm B
                const listB = swingLows.filter(lowB => {
                    const price = lowB.lowNum;
                    const isInRange = price >= bMin && price <= bMax && 
                                     lowB.openTime >= highest.openTime && 
                                     lowB.highNum <= highest.highNum;
                    
                    if (isInRange) {
                        // Kiểm tra không có điểm nào giữa A và B phá vỡ khuôn mẫu
                        return !candles.some(candle => 
                            candle.index > highest.index && 
                            candle.index < lowB.index && 
                            (candle.lowNum < lowB.lowNum || candle.highNum > highest.highNum)
                        );
                    }
                    
                    return false;
                });
                
                if (listB.length === 0) continue;
                
                // Duyệt qua từng điểm B tìm được
                for (const pointB of listB) {
                    // Tìm điểm C (extension hoặc retracement tùy theo mô hình)
                    let cMin: number, cMax: number;
                    
                    // Các mô hình khác nhau có cách tính C khác nhau
                    if (this.name === 'CYPHER' || this.name === 'SHARK') {
                        // C là extension của AB
                        cMin = highestPrice + (highestPrice - pointB.lowNum) * patternLevels.C_MIN;
                        cMax = highestPrice + (highestPrice - pointB.lowNum) * patternLevels.C_MAX;
                    } else {
                        // C là retracement của AB (như BAT, GARTLEY, BUTTERFLY, CRAB)
                        cMin = downFibonacciRetracement(pointB.lowNum, highestPrice, patternLevels.C_MIN);
                        cMax = downFibonacciRetracement(pointB.lowNum, highestPrice, patternLevels.C_MAX);
                    }
                    
                    // Tìm các swing high phù hợp cho điểm C
                    const listC = swingHighs.filter(highC => {
                        return highC.highNum >= cMin && 
                               highC.highNum <= cMax && 
                               highC.openTime > pointB.openTime;
                    });
                    
                    // Duyệt qua từng điểm C tìm được
                    for (const pointC of listC) {
                        if (pointC.openTime < pointB.openTime) continue;
                        
                        // Kiểm tra không có điểm nào giữa B và C phá vỡ khuôn mẫu
                        const isBCValid = !candles.some(candle => 
                            candle.openTime > pointB.openTime && 
                            candle.openTime < pointC.openTime && 
                            (candle.lowNum < pointB.lowNum || candle.highNum > pointC.highNum)
                        );
                        
                        if (!isBCValid) continue;
                        
                        // Tìm điểm D (phụ thuộc vào mô hình)
                        let dMin: number, dMax: number;
                        let dBCMin: number | null = null;
                        let dBCMax: number | null = null;
                        
                        if (this.name === 'BUTTERFLY' || this.name === 'CRAB') {
                            // D là extension của XA
                            dMin = upFibonacciRetracement(lowestPrice, highestPrice, patternLevels.D_MIN);
                            dMax = upFibonacciRetracement(lowestPrice, highestPrice, patternLevels.D_MAX);
                        } else if (this.name === 'BAT') {
                            // D sử dụng cả XA và BC
                            dMin = upFibonacciRetracement(lowestPrice, highestPrice, patternLevels.D_MIN);
                            dMax = upFibonacciRetracement(lowestPrice, highestPrice, patternLevels.D_MAX);
                            // Kiểm tra xem mô hình là BAT (có các thuộc tính D_BC_MIN và D_BC_MAX)
                            const batLevels = patternLevels as typeof HARMONICS.PATTERNS.BAT;
                            if ('D_BC_MIN' in batLevels && 'D_BC_MAX' in batLevels) {
                                dBCMin = upFibonacciRetracement(pointB.lowNum, pointC.highNum, batLevels.D_BC_MIN);
                                dBCMax = upFibonacciRetracement(pointB.lowNum, pointC.highNum, batLevels.D_BC_MAX);
                            }
                        } else {
                            // D là retracement của XC (như CYPHER, GARTLEY, SHARK)
                            dMin = upFibonacciRetracement(lowestPrice, pointC.highNum, patternLevels.D_MIN);
                            dMax = upFibonacciRetracement(lowestPrice, pointC.highNum, patternLevels.D_MAX);
                        }
                        
                        // Tìm các swing low phù hợp cho điểm D
                        const listD = swingLows.filter(lowD => {
                            const price = lowD.lowNum;
                            let isInRange = price >= dMin && price <= dMax && lowD.openTime > pointC.openTime;
                            
                            // Kiểm tra thêm điều kiện BC nếu cần
                            if (dBCMin !== null && dBCMax !== null) {
                                isInRange = isInRange && price >= dBCMin && price <= dBCMax;
                            }
                            
                            if (isInRange) {
                                // Kiểm tra không có điểm nào giữa C và D phá vỡ khuôn mẫu
                                return !candles.some(candle => 
                                    pointC.openTime < candle.openTime && 
                                    candle.openTime < lowD.openTime && 
                                    (candle.lowNum < lowD.lowNum || candle.highNum > pointC.highNum)
                                );
                            }
                            
                            return false;
                        });
                        
                        // Nếu tìm thấy điểm D, hoàn thành mô hình
                        if (listD.length > 0) {
                            results.push({
                                xPrice: lowest,
                                aPrice: highest,
                                bPrice: pointB,
                                cPrice: pointC,
                                dPrices: listD,
                                patternName: this.getBullishPatternName(),
                            });
                        }
                    }
                }
            }
        }
        
        return results;
    }
    
    /**
     * Phát hiện mô hình bearish
     * Thực hiện tương tự như hàm bullish nhưng đảo ngược các điều kiện
     */
    protected detectBearishPattern(candles: CustomCandle[], swingResult: SwingResult): ChartResult[] {
        const { swingLows, swingHighs } = swingResult;
        const results: ChartResult[] = [];
        const patternLevels = HARMONICS.PATTERNS[this.name as keyof typeof HARMONICS.PATTERNS];
        
        // Duyệt qua các swing high để tìm điểm X
        for (const [highestIndex, highest] of Object.entries(swingHighs)) {
            // Bỏ qua nếu không phải là điểm cao nhất trong vùng
            if (Number(highestIndex) > 0 && swingHighs[Number(highestIndex) - 1].highNum > swingHighs[Number(highestIndex)].highNum) {
                continue;
            }
            
            const highestPrice = highest.highNum;
            
            // Tìm các swing low xảy ra sau X
            const newLows = swingLows.filter(low => {
                return low.lowNum < highestPrice && low.openTime > highest.openTime;
            });
            
            if (newLows.length === 0) continue;
            
            // Duyệt qua từng swing low để tìm điểm A
            for (const lowest of newLows) {
                const lowestPrice = lowest.lowNum;
                
                // Bỏ qua nếu A không phù hợp
                if (highest.lowNum < lowest.lowNum || (lowest.index - highest.index) < 10) {
                    continue;
                }
                
                // Kiểm tra không có điểm nào giữa X và A phá vỡ khuôn mẫu
                const isXAValid = !candles.some(candle => 
                    candle.openTime > highest.openTime && 
                    candle.openTime < lowest.openTime && 
                    (candle.highNum > highest.highNum || candle.lowNum < lowest.lowNum)
                );
                
                if (!isXAValid) continue;
                
                // Kiểm tra không có swing high nào cao hơn X trong khoảng X->A
                const isXHighestValid = !swingHighs.some(high => 
                    high.index > highest.index && 
                    high.index < lowest.index && 
                    high.highNum > highest.highNum
                );
                
                if (!isXHighestValid) continue;
                
                // Tìm điểm B (retracement của XA)
                const bMin = downFibonacciRetracement(highestPrice, lowestPrice, patternLevels.B_MIN);
                const bMax = downFibonacciRetracement(highestPrice, lowestPrice, patternLevels.B_MAX);
                
                // Tìm các swing high phù hợp cho điểm B
                const listB = swingHighs.filter(highB => {
                    const price = highB.highNum;
                    const isInRange = price >= bMin && price <= bMax && 
                                     highB.openTime >= lowest.openTime && 
                                     highB.lowNum >= lowest.lowNum;
                    
                    if (isInRange) {
                        // Kiểm tra không có điểm nào giữa A và B phá vỡ khuôn mẫu
                        return !candles.some(candle => 
                            candle.index > lowest.index && 
                            candle.index < highB.index && 
                            (candle.highNum > highB.highNum || candle.lowNum < lowest.lowNum)
                        );
                    }
                    
                    return false;
                });
                
                if (listB.length === 0) continue;
                
                // Duyệt qua từng điểm B tìm được
                for (const pointB of listB) {
                    // Tìm điểm C (extension hoặc retracement tùy theo mô hình)
                    let cMin: number, cMax: number;
                    
                    // Các mô hình khác nhau có cách tính C khác nhau
                    if (this.name === 'CYPHER' || this.name === 'SHARK') {
                        // C là extension của AB
                        cMin = lowestPrice - (pointB.highNum - lowestPrice) * patternLevels.C_MIN;
                        cMax = lowestPrice - (pointB.highNum - lowestPrice) * patternLevels.C_MAX;
                    } else {
                        // C là retracement của AB (như BAT, GARTLEY, BUTTERFLY, CRAB)
                        cMin = upFibonacciRetracement(lowestPrice, pointB.highNum, patternLevels.C_MIN);
                        cMax = upFibonacciRetracement(lowestPrice, pointB.highNum, patternLevels.C_MAX);
                    }
                    
                    // Tìm các swing low phù hợp cho điểm C
                    const listC = swingLows.filter(lowC => {
                        return lowC.lowNum >= cMin && 
                               lowC.lowNum <= cMax && 
                               lowC.openTime > pointB.openTime;
                    });
                    
                    // Duyệt qua từng điểm C tìm được
                    for (const pointC of listC) {
                        if (pointC.openTime < pointB.openTime) continue;
                        
                        // Kiểm tra không có điểm nào giữa B và C phá vỡ khuôn mẫu
                        const isBCValid = !candles.some(candle => 
                            candle.openTime > pointB.openTime && 
                            candle.openTime < pointC.openTime && 
                            (candle.highNum > pointB.highNum || candle.lowNum < pointC.lowNum)
                        );
                        
                        if (!isBCValid) continue;
                        
                        // Tìm điểm D (phụ thuộc vào mô hình)
                        let dMin: number, dMax: number;
                        let dBCMin: number | null = null;
                        let dBCMax: number | null = null;
                        
                        if (this.name === 'BUTTERFLY' || this.name === 'CRAB') {
                            // D là extension của XA
                            dMin = downFibonacciRetracement(highestPrice, lowestPrice, patternLevels.D_MIN);
                            dMax = downFibonacciRetracement(highestPrice, lowestPrice, patternLevels.D_MAX);
                        } else if (this.name === 'BAT') {
                            // D sử dụng cả XA và BC
                            dMin = downFibonacciRetracement(highestPrice, lowestPrice, patternLevels.D_MIN);
                            dMax = downFibonacciRetracement(highestPrice, lowestPrice, patternLevels.D_MAX);
                            // Kiểm tra xem mô hình là BAT (có các thuộc tính D_BC_MIN và D_BC_MAX)
                            const batLevels = patternLevels as typeof HARMONICS.PATTERNS.BAT;
                            if ('D_BC_MIN' in batLevels && 'D_BC_MAX' in batLevels) {
                                dBCMin = downFibonacciRetracement(pointC.lowNum, pointB.highNum, batLevels.D_BC_MIN);
                                dBCMax = downFibonacciRetracement(pointC.lowNum, pointB.highNum, batLevels.D_BC_MAX);
                            }
                        } else {
                            // D là retracement của XC (như CYPHER, GARTLEY, SHARK)
                            dMin = downFibonacciRetracement(pointC.lowNum, highestPrice, patternLevels.D_MIN);
                            dMax = downFibonacciRetracement(pointC.lowNum, highestPrice, patternLevels.D_MAX);
                        }
                        
                        // Tìm các swing high phù hợp cho điểm D
                        const listD = swingHighs.filter(highD => {
                            const price = highD.highNum;
                            let isInRange = price >= dMin && price <= dMax && highD.openTime > pointC.openTime;
                            
                            // Kiểm tra thêm điều kiện BC nếu cần
                            if (dBCMin !== null && dBCMax !== null) {
                                isInRange = isInRange && price >= dBCMin && price <= dBCMax;
                            }
                            
                            if (isInRange) {
                                // Kiểm tra không có điểm nào giữa C và D phá vỡ khuôn mẫu
                                return !candles.some(candle => 
                                    pointC.openTime < candle.openTime && 
                                    candle.openTime < highD.openTime && 
                                    (candle.highNum > highD.highNum || candle.lowNum < pointC.lowNum)
                                );
                            }
                            
                            return false;
                        });
                        
                        // Nếu tìm thấy điểm D, hoàn thành mô hình
                        if (listD.length > 0) {
                            results.push({
                                xPrice: highest,
                                aPrice: lowest,
                                bPrice: pointB,
                                cPrice: pointC,
                                dPrices: listD,
                                patternName: this.getBearishPatternName(),
                            });
                        }
                    }
                }
            }
        }
        
        return results;
    }
}
