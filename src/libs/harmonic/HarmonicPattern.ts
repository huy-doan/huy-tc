// src/libs/harmonic/HarmonicPattern.ts
import { CustomCandle, ChartResult, SwingResult } from '~interfaces/common.interface';
import { HarmonicPattern, PatternConfig } from '~interfaces/harmonic.interface';
import { 
  upFibonacciRetracement, downFibonacciRetracement, 
  isInFibonacciRange, adjustFibonacci 
} from '~helpers/fibonacci.helper';
import { PATTERN_TYPE, FIBONACCI_ERROR_MARGIN } from '~config/harmonic.constants';

export abstract class BaseHarmonicPattern implements HarmonicPattern {
  name: string;
  type: string;
  config: PatternConfig;

  constructor(name: string, type: string, config: PatternConfig) {
    this.name = name;
    this.type = type;
    this.config = config;
  }

  /**
   * Tìm mô hình dựa vào loại (Bullish/Bearish)
   */
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
   * Kiểm tra xem hai số có xấp xỉ bằng nhau không (theo biên độ 0.1%)
   */
  protected approximateEqual(a: number, b: number): boolean {
    const left = parseFloat(Math.abs(a - b).toPrecision(4)) * 1;
    const right = parseFloat((a * 0.001).toPrecision(4)) * 1; 
    return left <= right;
  }

  /**
   * Kiểm tra xem có điểm nào nằm giữa hai điểm không
   */
  protected hasPointBetween(candles: CustomCandle[], startPoint: CustomCandle, endPoint: CustomCandle, 
                          conditions: { highCheck?: boolean, lowCheck?: boolean } = {}): boolean {
    const { highCheck = true, lowCheck = true } = conditions;
    
    const foundPoint = candles.find(item => {
      if (item.openTime <= startPoint.openTime || item.openTime >= endPoint.openTime) {
        return false;
      }
      
      let conditionMet = false;
      
      if (highCheck) {
        // Kiểm tra nếu có điểm nào cao hơn điểm cao nhất giữa hai điểm
        const maxHigh = Math.max(startPoint.highNum, endPoint.highNum);
        if (item.highNum > maxHigh) {
          conditionMet = true;
        }
      }
      
      if (lowCheck) {
        // Kiểm tra nếu có điểm nào thấp hơn điểm thấp nhất giữa hai điểm
        const minLow = Math.min(startPoint.lowNum, endPoint.lowNum);
        if (item.lowNum < minLow) {
          conditionMet = true;
        }
      }
      
      return conditionMet;
    });
    
    return !!foundPoint;
  }

  /**
   * Tìm mô hình Harmonic Bullish
   * Trình tự: X -> A -> B -> C -> D (đi lên - đi xuống - đi lên - đi xuống)
   */
  protected findBullishPattern(candles: CustomCandle[]): ChartResult[] {
    const results: ChartResult[] = [];
    const { swingLows, swingHighs } = this.findSwingLowsAndHighs(candles);
    
    // Lặp qua tất cả các swing lows tiềm năng làm điểm X
    for (const [lowestIndex, lowest] of Object.entries(swingLows)) {
      // Chỉ xét các điểm X thấp hơn điểm trước nó (nếu có)
      if (Number(lowestIndex) > 0 && swingLows[Number(lowestIndex) - 1].lowNum < lowest.lowNum) {
        continue;
      }
      
      const lowestPrice = lowest.lowNum;
      
      // Tìm tất cả các swing highs tiềm năng làm điểm A (sau điểm X)
      const potentialHighs = swingHighs.filter(high => 
        high.highNum > lowestPrice && high.openTime > lowest.openTime
      );
      
      if (potentialHighs.length === 0) continue;
      
      // Lặp qua tất cả các điểm A tiềm năng
      for (const highest of potentialHighs) {
        const highestPrice = highest.highNum;
        
        // Bỏ qua nếu các điều kiện cơ bản không đáp ứng
        if (lowest.highNum > highest.highNum || (highest.index - lowest.index) < 10) {
          continue;
        }
        
        // Kiểm tra xem có bất kỳ candle nào phá vỡ mô hình giữa X và A
        const isExistAHighest = candles.find(
          item => item.openTime > lowest.openTime && 
                  item.openTime < highest.openTime && 
                  (item.highNum > highest.highNum || item.lowNum < lowest.lowNum)
        );
        
        if (isExistAHighest) {
          continue;
        }
        
        // Kiểm tra thêm xem có swing low nào giữa X và A thấp hơn X
        const isExistXLowest = swingLows.find(
          item => item.index > lowest.index && 
                  item.index < highest.index && 
                  item.lowNum < lowest.lowNum
        );
        
        if (isExistXLowest) {
          continue;
        }
        
        // Tính toán mức Fibonacci cho điểm B
        const bMin = upFibonacciRetracement(lowestPrice, highestPrice, this.config.B_MIN);
        const bMax = upFibonacciRetracement(lowestPrice, highestPrice, this.config.B_MAX);
        
        // Tìm các điểm B tiềm năng (điểm B là điểm thấp sau điểm A)
        const potentialBPoints = swingLows.filter(lowB => {
          const price = lowB.lowNum;
          // B phải nằm trong khoảng Fibonacci và xuất hiện sau A
          const inFibRange = price >= bMin * (1 - FIBONACCI_ERROR_MARGIN) && 
                             price <= bMax * (1 + FIBONACCI_ERROR_MARGIN);
          
          const condition = inFibRange && 
                           lowB.openTime >= highest.openTime && 
                           lowB.highNum <= highest.highNum;
          
          // Nếu thỏa mãn, kiểm tra không có điểm nào phá vỡ mô hình giữa A và B
          if (condition) {
            const foundLowest = candles.find(item => 
              item.index > highest.index && 
              item.index < lowB.index && 
              (item.lowNum < lowB.lowNum || item.highNum > highest.highNum)
            );
            
            return !foundLowest;
          }
          
          return false;
        });
        
        if (potentialBPoints.length === 0) {
          continue;
        }
        
        // Tính toán mức Fibonacci cho điểm C
        const cMin = downFibonacciRetracement(lowestPrice, highestPrice, this.config.C_MIN);
        const cMax = downFibonacciRetracement(lowestPrice, highestPrice, this.config.C_MAX);
        
        // Tìm các điểm C tiềm năng (điểm C là điểm cao sau điểm B)
        const potentialCPoints = swingHighs.filter(highC => {
          const inFibRange = highC.highNum >= cMin * (1 - FIBONACCI_ERROR_MARGIN) && 
                             highC.highNum <= cMax * (1 + FIBONACCI_ERROR_MARGIN);
          return inFibRange && highC.openTime > highest.openTime;
        });
        
        // Lặp qua tất cả các cặp B-C tiềm năng
        for (const pointB of potentialBPoints) {
          for (const pointC of potentialCPoints) {
            // C phải xuất hiện sau B
            if (pointC.openTime < pointB.openTime) continue;
            
            // Kiểm tra không có điểm nào phá vỡ mô hình giữa B và C
            const unValidPeak = candles.find(item => 
              item.openTime > pointB.openTime && 
              item.openTime < pointC.openTime && 
              (item.lowNum < pointB.lowNum || item.highNum > pointC.highNum)
            );
            
            if (unValidPeak) {
              continue;
            }
            
            // Tính toán mức Fibonacci cho điểm D
            const dMin = upFibonacciRetracement(lowestPrice, pointC.highNum, this.config.D_MIN);
            const dMax = upFibonacciRetracement(lowestPrice, pointC.highNum, this.config.D_MAX);
            
            // Tìm các điểm D tiềm năng (điểm D là điểm thấp sau điểm C)
            const potentialDPoints = swingLows.filter(lowD => {
              const price = lowD.lowNum;
              // D phải nằm trong khoảng Fibonacci và xuất hiện sau C
              const inFibRange = price >= dMin * (1 - FIBONACCI_ERROR_MARGIN) && 
                                 price <= dMax * (1 + FIBONACCI_ERROR_MARGIN);
              
              const condition = inFibRange && lowD.openTime > pointC.openTime;
              
              // Nếu thỏa mãn, kiểm tra không có điểm nào phá vỡ mô hình giữa C và D
              if (condition) {
                const unValidPeak = candles.find(item => 
                  pointC.openTime < item.openTime && 
                  item.openTime < lowD.openTime && 
                  (item.lowNum < lowD.lowNum || item.highNum > pointC.highNum)
                );
                
                return !unValidPeak;
              }
              
              return false;
            });
            
            // Kiểm tra thêm mối quan hệ BC-D nếu có cấu hình
            let filteredDPoints = [...potentialDPoints];
            
            if (this.config.D_BC_MIN && this.config.D_BC_MAX && potentialDPoints.length > 0) {
              const dBCMin = upFibonacciRetracement(pointB.lowNum, pointC.highNum, this.config.D_BC_MIN);
              const dBCMax = upFibonacciRetracement(pointB.lowNum, pointC.highNum, this.config.D_BC_MAX);
              
              filteredDPoints = potentialDPoints.filter(d => {
                const price = d.lowNum;
                return price >= dBCMin * (1 - FIBONACCI_ERROR_MARGIN) && 
                       price <= dBCMax * (1 + FIBONACCI_ERROR_MARGIN);
              });
            }
            
            // Nếu tìm thấy ít nhất một điểm D hợp lệ, thêm mô hình vào kết quả
            if (filteredDPoints.length > 0) {
              results.push({
                xPrice: lowest,
                aPrice: highest,
                bPrice: pointB,
                cPrice: pointC,
                dPrices: filteredDPoints,
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
   * Trình tự: X -> A -> B -> C -> D (đi xuống - đi lên - đi xuống - đi lên)
   */
  protected findBearishPattern(candles: CustomCandle[]): ChartResult[] {
    const results: ChartResult[] = [];
    const { swingLows, swingHighs } = this.findSwingLowsAndHighs(candles);
    
    // Lặp qua tất cả các swing highs tiềm năng làm điểm X
    for (const [highestIndex, highest] of Object.entries(swingHighs)) {
      // Chỉ xét các điểm X cao hơn điểm trước nó (nếu có)
      if (Number(highestIndex) > 0 && swingHighs[Number(highestIndex) - 1].highNum > highest.highNum) {
        continue;
      }
      
      const highestPrice = highest.highNum;
      
      // Tìm tất cả các swing lows tiềm năng làm điểm A (sau điểm X)
      const potentialLows = swingLows.filter(low => 
        low.lowNum < highestPrice && low.openTime > highest.openTime
      );
      
      if (potentialLows.length === 0) continue;
      
      // Lặp qua tất cả các điểm A tiềm năng
      for (const lowest of potentialLows) {
        const lowestPrice = lowest.lowNum;
        
        // Bỏ qua nếu các điều kiện cơ bản không đáp ứng
        if (highest.lowNum < lowest.lowNum || (lowest.index - highest.index) < 10) {
          continue;
        }
        
        // Kiểm tra xem có bất kỳ candle nào phá vỡ mô hình giữa X và A
        const isExistAHighest = candles.find(
          item => item.openTime > highest.openTime && 
                  item.openTime < lowest.openTime && 
                  (item.highNum > highest.highNum || item.lowNum < lowest.lowNum)
        );
        
        if (isExistAHighest) {
          continue;
        }
        
        // Kiểm tra thêm xem có swing high nào giữa X và A cao hơn X
        const isExistXHighest = swingHighs.find(
          item => item.index > highest.index && 
                  item.index < lowest.index && 
                  item.highNum > highest.highNum
        );
        
        if (isExistXHighest) {
          continue;
        }
        
        // Tính toán mức Fibonacci cho điểm B
        const bMin = downFibonacciRetracement(highestPrice, lowestPrice, this.config.B_MIN);
        const bMax = downFibonacciRetracement(highestPrice, lowestPrice, this.config.B_MAX);
        
        // Tìm các điểm B tiềm năng (điểm B là điểm cao sau điểm A)
        const potentialBPoints = swingHighs.filter(highB => {
          const price = highB.highNum;
          // B phải nằm trong khoảng Fibonacci và xuất hiện sau A
          const inFibRange = price >= bMin * (1 - FIBONACCI_ERROR_MARGIN) && 
                             price <= bMax * (1 + FIBONACCI_ERROR_MARGIN);
          
          const condition = inFibRange && 
                           highB.openTime >= lowest.openTime && 
                           highB.lowNum >= lowest.lowNum;
          
          // Nếu thỏa mãn, kiểm tra không có điểm nào phá vỡ mô hình giữa A và B
          if (condition) {
            const foundHighest = candles.find(item => 
              item.index > lowest.index && 
              item.index < highB.index && 
              (item.highNum > highB.highNum || item.lowNum < lowest.lowNum)
            );
            
            return !foundHighest;
          }
          
          return false;
        });
        
        if (potentialBPoints.length === 0) {
          continue;
        }
        
        // Tính toán mức Fibonacci cho điểm C
        const cMin = upFibonacciRetracement(lowestPrice, highestPrice, this.config.C_MIN);
        const cMax = upFibonacciRetracement(lowestPrice, highestPrice, this.config.C_MAX);
        
        // Tìm các điểm C tiềm năng (điểm C là điểm thấp sau điểm B)
        const potentialCPoints = swingLows.filter(lowC => {
          const inFibRange = lowC.lowNum >= cMin * (1 - FIBONACCI_ERROR_MARGIN) && 
                             lowC.lowNum <= cMax * (1 + FIBONACCI_ERROR_MARGIN);
          return inFibRange && lowC.openTime > lowest.openTime;
        });
        
        // Lặp qua tất cả các cặp B-C tiềm năng
        for (const pointB of potentialBPoints) {
          for (const pointC of potentialCPoints) {
            // C phải xuất hiện sau B
            if (pointC.openTime < pointB.openTime) continue;
            
            // Kiểm tra không có điểm nào phá vỡ mô hình giữa B và C
            const unValidPeak = candles.find(item => 
              item.openTime > pointB.openTime && 
              item.openTime < pointC.openTime && 
              (item.highNum > pointB.highNum || item.lowNum < pointC.lowNum)
            );
            
            if (unValidPeak) {
              continue;
            }
            
            // Tính toán mức Fibonacci cho điểm D
            const dMin = downFibonacciRetracement(highestPrice, pointC.lowNum, this.config.D_MIN);
            const dMax = downFibonacciRetracement(highestPrice, pointC.lowNum, this.config.D_MAX);
            
            // Tìm các điểm D tiềm năng (điểm D là điểm cao sau điểm C)
            const potentialDPoints = swingHighs.filter(highD => {
              const price = highD.highNum;
              // D phải nằm trong khoảng Fibonacci và xuất hiện sau C
              const inFibRange = price >= dMin * (1 - FIBONACCI_ERROR_MARGIN) && 
                                 price <= dMax * (1 + FIBONACCI_ERROR_MARGIN);
              
              const condition = inFibRange && highD.openTime > pointC.openTime;
              
              // Nếu thỏa mãn, kiểm tra không có điểm nào phá vỡ mô hình giữa C và D
              if (condition) {
                const unValidPeak = candles.find(item => 
                  pointC.openTime < item.openTime && 
                  item.openTime < highD.openTime && 
                  (item.highNum > highD.highNum || item.lowNum < pointC.lowNum)
                );
                
                return !unValidPeak;
              }
              
              return false;
            });
            
            // Kiểm tra thêm mối quan hệ BC-D nếu có cấu hình
            let filteredDPoints = [...potentialDPoints];
            
            if (this.config.D_BC_MIN && this.config.D_BC_MAX && potentialDPoints.length > 0) {
              const dBCMin = downFibonacciRetracement(pointC.lowNum, pointB.highNum, this.config.D_BC_MIN);
              const dBCMax = downFibonacciRetracement(pointC.lowNum, pointB.highNum, this.config.D_BC_MAX);
              
              filteredDPoints = potentialDPoints.filter(d => {
                const price = d.highNum;
                return price >= dBCMin * (1 - FIBONACCI_ERROR_MARGIN) && 
                       price <= dBCMax * (1 + FIBONACCI_ERROR_MARGIN);
              });
            }
            
            // Nếu tìm thấy ít nhất một điểm D hợp lệ, thêm mô hình vào kết quả
            if (filteredDPoints.length > 0) {
              results.push({
                xPrice: highest,
                aPrice: lowest,
                bPrice: pointB,
                cPrice: pointC,
                dPrices: filteredDPoints,
              });
            }
          }
        }
      }
    }
    
    return results;
  }
}
