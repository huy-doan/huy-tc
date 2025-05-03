// src/libs/harmonic/SwingDetector.ts
import { CustomCandle, SwingResult } from '~interfaces/common.interface';
import { HARMONICS } from '~config/harmonics.config';

export class SwingDetector {
    /**
     * Tìm các điểm swing high và swing low với thuật toán cải tiến
     * @param data - Mảng nến
     * @param lookback - Số nến nhìn lại để xác định swing (mặc định 3)
     * @returns Mảng các swing lows và swing highs
     */
    static findSwingLowsAndHighs(data: CustomCandle[], lookback: number = 3): SwingResult {
        if (data.length < lookback * 2 + 1) {
            return { swingLows: [], swingHighs: [] };
        }

        const swingLows: CustomCandle[] = [];
        const swingHighs: CustomCandle[] = [];
        const sensitivity = HARMONICS.SWING_SETTINGS.SENSITIVITY;
        const minCandlesBetween = HARMONICS.SWING_SETTINGS.MIN_CANDLES_BETWEEN_SWINGS;

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

    /**
     * Lọc bỏ các swing points quá nhỏ
     * @param swingPoints - Mảng swing points
     * @param data - Mảng nến đầy đủ
     * @param minAmplitude - Biên độ tối thiểu tương đối (tỉ lệ với ATR)
     */
    static filterSignificantSwings(
        result: SwingResult, 
        data: CustomCandle[], 
        minAmplitude: number = 0.5
    ): SwingResult {
        // Tính ATR cơ bản (Average True Range)
        const trueRanges: number[] = [];
        for (let i = 1; i < data.length; i++) {
            const current = data[i];
            const previous = data[i - 1];
            const tr = Math.max(
                current.highNum - current.lowNum,
                Math.abs(current.highNum - previous.closeNum),
                Math.abs(current.lowNum - previous.closeNum)
            );
            trueRanges.push(tr);
        }
        
        // Tính ATR trung bình (14 periods)
        const period = Math.min(14, trueRanges.length);
        const atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
        
        // Lọc swing lows
        const filteredSwingLows = result.swingLows.filter((swingLow, i) => {
            // Kiểm tra xem biên độ từ swing high gần nhất có đủ lớn không
            const nearestSwingHigh = this.findNearestSwingHigh(swingLow, result.swingHighs);
            if (!nearestSwingHigh) return true; // Giữ lại nếu không tìm thấy swing high gần nhất
            
            const amplitude = nearestSwingHigh.highNum - swingLow.lowNum;
            return amplitude >= atr * minAmplitude;
        });
        
        // Lọc swing highs
        const filteredSwingHighs = result.swingHighs.filter((swingHigh, i) => {
            // Kiểm tra xem biên độ từ swing low gần nhất có đủ lớn không
            const nearestSwingLow = this.findNearestSwingLow(swingHigh, result.swingLows);
            if (!nearestSwingLow) return true; // Giữ lại nếu không tìm thấy swing low gần nhất
            
            const amplitude = swingHigh.highNum - nearestSwingLow.lowNum;
            return amplitude >= atr * minAmplitude;
        });
        
        return { swingLows: filteredSwingLows, swingHighs: filteredSwingHighs };
    }

    /**
     * Tìm swing high gần nhất với một swing low
     */
    private static findNearestSwingHigh(swingLow: CustomCandle, swingHighs: CustomCandle[]): CustomCandle | null {
        let nearest: CustomCandle | null = null;
        let minDistance = Number.MAX_SAFE_INTEGER;
        
        for (const swingHigh of swingHighs) {
            const distance = Math.abs(swingHigh.index - swingLow.index);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = swingHigh;
            }
        }
        
        return nearest;
    }

    /**
     * Tìm swing low gần nhất với một swing high
     */
    private static findNearestSwingLow(swingHigh: CustomCandle, swingLows: CustomCandle[]): CustomCandle | null {
        let nearest: CustomCandle | null = null;
        let minDistance = Number.MAX_SAFE_INTEGER;
        
        for (const swingLow of swingLows) {
            const distance = Math.abs(swingLow.index - swingHigh.index);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = swingLow;
            }
        }
        
        return nearest;
    }
}
