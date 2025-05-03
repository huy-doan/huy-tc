// src/libs/harmonic/HarmonicPattern.ts
import { CustomCandle, ChartResult, SwingResult } from '~interfaces/common.interface';
import { HarmonicPattern, PatternConfig } from '~interfaces/harmonic.interface';
import { upFibonacciRetracement, downFibonacciRetracement } from '~helpers/formula.helper';
import { PATTERN_TYPE } from '~config/harmonic.constants';

export abstract class BaseHarmonicPattern implements HarmonicPattern {
  name: string;
  type: string;
  config: PatternConfig;

  constructor(name: string, type: string, config: PatternConfig) {
    this.name = name;
    this.type = type;
    this.config = config;
  }

  findPattern(candles: CustomCandle[]): ChartResult[] {
    if (this.type === PATTERN_TYPE.BULLISH) {
      return this.findBullishPattern(candles);
    } else {
      return this.findBearishPattern(candles);
    }
  }

  /**
   * Tìm swing highs và swing lows trong một chuỗi candles
   */
  protected findSwingLowsAndHighs(data: CustomCandle[]): SwingResult {
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

  /**
   * Kiểm tra xem có điểm nào nằm giữa hai điểm không
   */
  protected hasPointBetween(candles: CustomCandle[], startPoint: CustomCandle, endPoint: CustomCandle, 
                            checkHigher: boolean = true, checkLower: boolean = true): boolean {
    return !!candles.find(item => 
      item.openTime > startPoint.openTime && 
      item.openTime < endPoint.openTime && 
      ((checkHigher && item.highNum > Math.max(startPoint.highNum, endPoint.highNum)) || 
       (checkLower && item.lowNum < Math.min(startPoint.lowNum, endPoint.lowNum)))
    );
  }

  /**
   * Tìm mô hình Harmonic Bullish
   */
  protected findBullishPattern(candles: CustomCandle[]): ChartResult[] {
    const results: ChartResult[] = [];
    const { swingLows, swingHighs } = this.findSwingLowsAndHighs(candles);
    
    // Tìm điểm X (swing low đầu tiên)
    for (const [lowestIndex, lowest] of Object.entries(swingLows)) {
      // Bỏ qua nếu không phải là điểm thấp nhất
      if (Number(lowestIndex) > 0 && swingLows[Number(lowestIndex) - 1].lowNum < lowest.lowNum) {
        continue;
      }
      
      const lowestPrice = lowest.lowNum;
      
      // Tìm điểm A (swing high sau điểm X)
      const potentialHighs = swingHighs.filter(high => 
        high.highNum > lowestPrice && high.openTime > lowest.openTime
      );
      
      if (potentialHighs.length === 0) continue;
      
      for (const highest of potentialHighs) {
        if (lowest.highNum > highest.highNum || (highest.index - lowest.index) < 10) continue;
        
        // Kiểm tra không có điểm nào giữa X và A phá vỡ mô hình
        if (this.hasPointBetween(candles, lowest, highest)) continue;
        
        const highestPrice = highest.highNum;
        
        // Tìm điểm B (retracement từ XA)
        const bMin = upFibonacciRetracement(lowestPrice, highestPrice, this.config.B_MIN);
        const bMax = upFibonacciRetracement(lowestPrice, highestPrice, this.config.B_MAX);
        
        const potentialBPoints = swingLows.filter(lowB => {
          const price = lowB.lowNum;
          // Điểm B nằm trong khoảng retracement
          const inRange = price >= bMin && price <= bMax && 
                          lowB.openTime >= highest.openTime && 
                          lowB.highNum <= highest.highNum;
          
          if (inRange) {
            // Kiểm tra không có điểm nào giữa A và B phá vỡ mô hình
            return !this.hasPointBetween(candles, highest, lowB);
          }
          return false;
        });
        
        if (potentialBPoints.length === 0) continue;
        
        // Tìm điểm C (retracement/extension từ XA)
        const cMin = downFibonacciRetracement(lowestPrice, highestPrice, this.config.C_MIN);
        const cMax = downFibonacciRetracement(lowestPrice, highestPrice, this.config.C_MAX);
        
        const potentialCPoints = swingHighs.filter(highC => 
          highC.highNum >= cMin && highC.highNum <= cMax && highC.openTime > highest.openTime
        );
        
        // Xử lý các điểm B và C
        for (const pointB of potentialBPoints) {
          for (const pointC of potentialCPoints) {
            if (pointC.openTime < pointB.openTime) continue;
            
            // Kiểm tra không có điểm nào giữa B và C phá vỡ mô hình
            if (this.hasPointBetween(candles, pointB, pointC)) continue;
            
            // Kiểm tra C theo tỉ lệ AB (nếu cần)
            if (this.config.C_AB_MIN && this.config.C_AB_MAX) {
              const cAbMin = upFibonacciRetracement(pointB.lowNum, highest.highNum, this.config.C_AB_MIN);
              const cAbMax = upFibonacciRetracement(pointB.lowNum, highest.highNum, this.config.C_AB_MAX);
              
              if (pointC.highNum < cAbMin || pointC.highNum > cAbMax) continue;
            }
            
            // Tìm điểm D
            const dMin = upFibonacciRetracement(lowestPrice, pointC.highNum, this.config.D_MIN);
            const dMax = upFibonacciRetracement(lowestPrice, pointC.highNum, this.config.D_MAX);
            
            let potentialDPoints = swingLows.filter(lowD => {
              const price = lowD.lowNum;
              const inRange = price >= dMin && price <= dMax && lowD.openTime > pointC.openTime;
              
              if (inRange) {
                // Kiểm tra không có điểm nào giữa C và D phá vỡ mô hình
                return !this.hasPointBetween(candles, pointC, lowD);
              }
              return false;
            });
            
            // Kiểm tra D theo tỉ lệ BC (nếu cần)
            if (this.config.D_BC_MIN && this.config.D_BC_MAX && potentialDPoints.length > 0) {
              const dBcMin = upFibonacciRetracement(pointB.lowNum, pointC.highNum, this.config.D_BC_MIN);
              const dBcMax = upFibonacciRetracement(pointB.lowNum, pointC.highNum, this.config.D_BC_MAX);
              
              potentialDPoints = potentialDPoints.filter(d => 
                d.lowNum >= dBcMin && d.lowNum <= dBcMax
              );
            }
            
            if (potentialDPoints.length > 0) {
              results.push({
                xPrice: lowest,
                aPrice: highest,
                bPrice: pointB,
                cPrice: pointC,
                dPrices: potentialDPoints,
              });
            }
          }
        }
      }
    }
    
    return results;
  }

  /**
   * Tìm mô hình Harmonic Bearish
   */
  protected findBearishPattern(candles: CustomCandle[]): ChartResult[] {
    const results: ChartResult[] = [];
    const { swingLows, swingHighs } = this.findSwingLowsAndHighs(candles);
    
    // Tìm điểm X (swing high đầu tiên)
    for (const [highestIndex, highest] of Object.entries(swingHighs)) {
      // Bỏ qua nếu không phải là điểm cao nhất
      if (Number(highestIndex) > 0 && swingHighs[Number(highestIndex) - 1].highNum > highest.highNum) {
        continue;
      }
      
      const highestPrice = highest.highNum;
      
      // Tìm điểm A (swing low sau điểm X)
      const potentialLows = swingLows.filter(low => 
        low.lowNum < highestPrice && low.openTime > highest.openTime
      );
      
      if (potentialLows.length === 0) continue;
      
      for (const lowest of potentialLows) {
        if (highest.lowNum < lowest.lowNum || (lowest.index - highest.index) < 10) continue;
        
        // Kiểm tra không có điểm nào giữa X và A phá vỡ mô hình
        if (this.hasPointBetween(candles, highest, lowest)) continue;
        
        const lowestPrice = lowest.lowNum;
        
        // Tìm điểm B (retracement từ XA)
        const bMin = downFibonacciRetracement(highestPrice, lowestPrice, this.config.B_MIN);
        const bMax = downFibonacciRetracement(highestPrice, lowestPrice, this.config.B_MAX);
        
        const potentialBPoints = swingHighs.filter(highB => {
          const price = highB.highNum;
          // Điểm B nằm trong khoảng retracement
          const inRange = price >= bMin && price <= bMax && 
                          highB.openTime >= lowest.openTime && 
                          highB.lowNum >= lowest.lowNum;
          
          if (inRange) {
            // Kiểm tra không có điểm nào giữa A và B phá vỡ mô hình
            return !this.hasPointBetween(candles, lowest, highB);
          }
          return false;
        });
        
        if (potentialBPoints.length === 0) continue;
        
        // Tìm điểm C (retracement/extension từ XA)
        const cMin = upFibonacciRetracement(lowestPrice, highestPrice, this.config.C_MIN);
        const cMax = upFibonacciRetracement(lowestPrice, highestPrice, this.config.C_MAX);
        
        const potentialCPoints = swingLows.filter(lowC => 
          lowC.lowNum >= cMin && lowC.lowNum <= cMax && lowC.openTime > lowest.openTime
        );
        
        // Xử lý các điểm B và C
        for (const pointB of potentialBPoints) {
          for (const pointC of potentialCPoints) {
            if (pointC.openTime < pointB.openTime) continue;
            
            // Kiểm tra không có điểm nào giữa B và C phá vỡ mô hình
            if (this.hasPointBetween(candles, pointB, pointC)) continue;
            
            // Kiểm tra C theo tỉ lệ AB (nếu cần)
            if (this.config.C_AB_MIN && this.config.C_AB_MAX) {
              const cAbMin = downFibonacciRetracement(pointB.highNum, lowest.lowNum, this.config.C_AB_MIN);
              const cAbMax = downFibonacciRetracement(pointB.highNum, lowest.lowNum, this.config.C_AB_MAX);
              
              if (pointC.lowNum < cAbMin || pointC.lowNum > cAbMax) continue;
            }
            
            // Tìm điểm D
            const dMin = downFibonacciRetracement(highestPrice, pointC.lowNum, this.config.D_MIN);
            const dMax = downFibonacciRetracement(highestPrice, pointC.lowNum, this.config.D_MAX);
            
            let potentialDPoints = swingHighs.filter(highD => {
              const price = highD.highNum;
              const inRange = price >= dMin && price <= dMax && highD.openTime > pointC.openTime;
              
              if (inRange) {
                // Kiểm tra không có điểm nào giữa C và D phá vỡ mô hình
                return !this.hasPointBetween(candles, pointC, highD);
              }
              return false;
            });
            
            // Kiểm tra D theo tỉ lệ BC (nếu cần)
            if (this.config.D_BC_MIN && this.config.D_BC_MAX && potentialDPoints.length > 0) {
              const dBcMin = downFibonacciRetracement(pointC.lowNum, pointB.highNum, this.config.D_BC_MIN);
              const dBcMax = downFibonacciRetracement(pointC.lowNum, pointB.highNum, this.config.D_BC_MAX);
              
              potentialDPoints = potentialDPoints.filter(d => 
                d.highNum >= dBcMin && d.highNum <= dBcMax
              );
            }
            
            if (potentialDPoints.length > 0) {
              results.push({
                xPrice: highest,
                aPrice: lowest,
                bPrice: pointB,
                cPrice: pointC,
                dPrices: potentialDPoints,
              });
            }
          }
        }
      }
    }
    
    return results;
  }
}
